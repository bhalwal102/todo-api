# Todo REST API

I built a Todo REST API using Node.js and Express. The API can create, list,
filter, update, and delete todos. Each todo has one of three states: `todo`,
`doing`, or `done`. Todos are stored in an array, so restarting the server
clears the list.

## How to run

```sh
npm install
node server.js
```

The API runs at `http://localhost:3000`.

## How to test

Open `tests.rest` in VS Code with the REST Client extension. Run request #1
to create a todo. Copy the `id` from the response and paste it after
`@todoId =` at the top of the file. Run #11 before #7, because #7 deletes
the todo. Run #8 after #7 to confirm the todo is gone.

## Test results

- POST returned `201 Created` and set the default state to `todo`.
- GET by ID returned `200 OK` and the requested todo.
- PUT returned `200 OK` and changed the state to `doing`.
- DELETE returned `204 No Content`. A GET for the deleted ID returned `404 Not Found`.
- Malformed JSON and invalid states returned `400 Bad Request`.

## Reflection

I learned how to test an Express API with VS Code REST Client. Using
`{{todoId}}` helped me reuse the same ID across requests. I also learned why
an invalid state returns `400`, while a deleted todo returns `404`.