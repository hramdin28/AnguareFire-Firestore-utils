# AnguareFire-Firestore-utils
Utils to make firestore queries

# Data structure example:
```
product
  - reference id
  - Name
  - brand
  - category[]
  
brand
  - reference id
  - name

category
  - reference id
  - name
  
```
# Example
```
product
  - reference id : '/product1'
  - name : 'Pname1'
  - brand : '/brand/brand1'
  - category[
  '/category/cate1',
  '/category/cate2'
  ]
  
brand
  - reference id : '/product1'
  - name : 'Brand 1'

category
doc:
  - reference id : '/cate1'
  - name: 'Cate Name 1'
doc:  
  - reference id : '/cate2'
  - name: 'Cate Name 2'
  
```
# The Collections and documents are joined together using document reference ids

Function to join by document reference id:
```
public joinCollectionByReferenceIds(collection: string, collectionsMap: {collection: string, joinColumn: string}[])
```
parameters:
```
collection: string -> the main collection to make joins. in this example it is the product collection.
collectionsMap: {collection: string, joinColumn: string}[] -> an array of collections to join:
collection: collection to join
joinColumn: the column from the main collection(in this example, the product collection) to join to the sub collection.
```
