# Checklist

<!-- Make sure you fill out this checklist with what you've done before submitting! -->

- [x] Read the README [please please please]
- [x] Something cool!
- [x] Back-end
  - [x] Minimum Requirements
    - [x] Setup MongoDB database
    - [x] Setup item requests collection
    - [x] `PUT /api/request`
    - [x] `GET /api/request?page=_`
  - [x] Main Requirements
    - [x] `GET /api/request?status=pending`
    - [x] `PATCH /api/request`
  - [ ] Above and Beyond
    - [ ] Batch edits
    - [ ] Batch deletes
- [ ] Front-end
  - [ ] Minimum Requirements
    - [ ] Dropdown component
    - [ ] Table component
    - [ ] Base page [table with data]
    - [ ] Table dropdown interactivity
  - [ ] Main Requirements
    - [ ] Pagination
    - [ ] Tabs
  - [ ] Above and Beyond
    - [ ] Batch edits
    - [ ] Batch deletes

# Notes

<!-- Notes go here -->
I accidently edited the routes.ts in the /api/mock/requests for the backend so my code should just be there. I replaced the original routes.ts inside the mock folder. Sorry for the late notice!

PUT, GET, and PATCH all use /api/mock/request...

Test Examples:
- curl -X GET "http://localhost:3000/api/mock/request?status=rejected&page=1"
- curl -X GET "http://localhost:3000/api/request?status=pending&page=1"
curl -X PATCH "http://localhost:3000/api/mock/request" \  
-H "Content-Type: application/json" \
-d '{
"id": "Replace with actual id",
"status": "rejected"
}'

ENV File:
MONGO_URL=mongodb://127.0.0.1:27017/dev-takehome
