# Catena doc tool

The Catena doc tool `catena-doc-gen` can be used to export metadata about Catena to aid documentation. For example, it
is used to export information about Catena services as an OpenAPI specification for this documentation.

## Example exporting OpenAPI spec

After building Catena, the doc tool command `dump-openapi-spec` can be used to generate an OpenAPI spec, such as
`apis/catena-tools-core.yaml` used by Redocly:

```shell
./catena-doc-gen/bin/Debug/net8.0/catena-doc-gen dump-openapi-spec > catena-open-api.yaml
```

This command will build a Catena node with all services enabled, except those marked as examples or experimental, with
Swagger support enabled, and will write the OpenAPI spec for those services to standard out.

(The `-debug` or `-d` flag can also be added to debug the embedded Catena node. The node output will be printed to
standard error.)

## Example exporting module info

After building Catena, the doc tool command `dump-catena-modules` can be used to produce a JSON object containing the
available Catena modules and information about them such as the source file, the type of service, and any dependencies.

```shell
./catena-doc-gen/bin/Debug/net8.0/catena-doc-gen dump-catena-modules > catena-modules.json
```