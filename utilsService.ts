import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { switchMap, map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor(private db: AngularFirestore) {}

  public joinCollectionByReferenceIds(
    collection: string,
    collectionsMap: {collection: string, joinColumn: string}[]
  ) {
    const mainCollectionData = [];
    const subCollectionAllIndexes = [];
    this.fetch(collection)
      .snapshotChanges()
      .pipe(
        switchMap(collectionData => {
          const requests$ = [];
          let indexes = 0;
          collectionData.forEach(rowElement => {
            const pData = rowElement.payload.doc.data();
            const id = rowElement.payload.doc.id;
            mainCollectionData.push({ id, ...pData });
            const subCollectionRowIndexes = {};
            collectionsMap.forEach(subCollection => {

              if (pData.hasOwnProperty(subCollection.joinColumn)) {
                if (!subCollectionRowIndexes[subCollection.joinColumn]) {
                  subCollectionRowIndexes[subCollection.joinColumn] = [];
                }
                if (pData[subCollection.joinColumn] instanceof Array) {
                  pData[subCollection.joinColumn].forEach(child => {
                    subCollectionRowIndexes[subCollection.joinColumn].push(indexes);
                    requests$.push(
                      this.db.doc(`${subCollection.collection}/${child.id}`).valueChanges()
                    );
                    indexes++;
                  });
                } else {
                  subCollectionRowIndexes[subCollection.joinColumn].push(indexes);
                  requests$.push(
                    this.db
                      .doc(`${subCollection.collection}/${pData[subCollection.joinColumn].id}`)
                      .valueChanges()
                  );
                  indexes++;
                }
              }
            });
            subCollectionAllIndexes.push(subCollectionRowIndexes);
          });
          return combineLatest(requests$);
        }),
        map(joins => {
          return mainCollectionData.map((v, i) => {
            Object.entries(subCollectionAllIndexes[i]).forEach(element => {
              const subCollectionName = element[0];
              const subCollectionValue = element[1] as number[];
              if (v[subCollectionName] instanceof Array) {
                for (
                  let index = 0;
                  index < subCollectionValue.length;
                  index++
                ) {
                  const id = v[subCollectionName][index].id;
                  v[subCollectionName][index] = {
                    id,
                    ...joins[subCollectionValue[index]]
                  };
                }
              } else {
                const id = v[subCollectionName].id;
                v[subCollectionName] = { id, ...joins[subCollectionValue[0]] };
              }
            });
            return v;
          });
        })
      );
  }

  public fetch(collection: string): AngularFirestoreCollection<any> {
    return this.db.collection(`/${collection}`);
  }
  public createDocument(collection: string, data: any) {
    this.fetch(collection).add(data);
  }
  public updateDocument(collection: string, id: string, data: any) {
    this.db.doc(`${collection}/${id}`).update(data);
  }
  public deleteDocumentId(collection: string, id: string) {
    this.db.doc(`${collection}/${id}`).delete();
  }
}
