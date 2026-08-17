# gRPCurl

`grpcurl` is a tool like `curl` that can be used to make requests of gRPC services like the ones in Catena. It can aid in debugging Catena services, performing health checks, scripting around Catena, etc.

Sources and install instructions are found on the [`grpcurl` GitHub project](https://github.com/fullstorydev/grpcurl#installation).

Available services and message types can be listed or described with grpcurl:

* `grpcurl -plaintext localhost:5001 list` - will list the available services
* `grpcurl -plaintext localhost:5001 list <fully-qualified service>` - will list the available services
* `grpcurl -plaintext localhost:5001 describe <fully-qualified service>` - will detail the RPC request and response message types
* `grpcurl -plaintext localhost:5001 describe <fully-qualified message type>` - will detail the fields of the type
* `grpcurl -plaintext localhost:5001 describe` - will detail all RPCs (long)

## Examples 

### Checking Catena node health

This command can be found in some example or demo docker compose files:

```grpcurl -plaintext localhost:5001 catena.catena_node_inspection.CatenaNodeInspection/NodeIsHealthy```

### Making a request with a session

Include the `catena-session-id` header with the `-H` option, ex:

```grpcurl -H 'catena-session-id: session-9fe5c6da-6144-4e9f-9338-7570cc11c838' -plaintext localhost:5001 catena.catena_authentication.CatenaAuthentication/Logout```

### Making a request with data

A request for grpcurl is constructed using a JSON object. The `-d=@` option will use a request written to stdin.

Enums values can be a numeral or a string.

In this example, the `-v` option is used to print the response headers since a login will return a new session ID in the `catena-session-id` header: 

```echo '{"provider": 4, "payload":"test53"}' | grpcurl -plaintext -d=@ -v localhost:5001 catena.catena_authentication.CatenaAuthentication/LoginWithProvider```