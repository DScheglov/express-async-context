# expess-async-context &middot; Basic Example

The example is aimed to demonstrate how to use `express-async-context`.

## Installation

```shell
git clone https://github.com/DScheglov/express-async-context.git
cd express-async-context/example
npm install
```

## Start Project

```shell
npm start
```

**Output**:

```shell
Server is listening on port: 8080
Follow: http://localhost:8080/trace-id
```

----

**Requests**:

```shell
curl http://localhost:8080/trace-id
```

```json
{"traceId":"94933859144933263607"}
```

Each time new `traceId`.

----


```shell
curl -H "X-Request-Id: 62313128484455049261" http://localhost:8080/trace-id
```

```json
{"traceId":"62313128484455049261"}
```

Always the same `traceId`

----

```shell
curl http://localhost:8080/error
```

```json
{"error":"Error in 39561315208374869812"}
```

And output to the server console:

```shell
39561315208374869812: Generating an Error
39561315208374869812: Error in 39561315208374869812
```