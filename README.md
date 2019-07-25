Client-Server template application
----------------------------------

* `./gradlew dockerBuildImage` -- build production all-in-one docker image
* `./gradlew :server:run` -- run server at 8080 (will also try to serve static, but do not use it)
* `cd client && npm install && npm start` -- start dev server with hot reload at 9000
