# Adding an SQL database

An SQL database is a great approach when a service needs to store some data that will persist across restarts of a Catena node.

Catena provides a framework to quickly implement new SQL databases with migrations and configuration to fit nicely with Catena services.

A typical database implementation in Catena consists of 3 parts:
1. A configuration class. This will be where connection parameters and other options are located to be read from the Catena node configuration.
2. A class that represents the database with operations to access the data. These methods are what services will use.
3. One or more migration classes. The first migration will create the database table(s) and any initial data necessary.

## An example database

Here we will create a database named `TelemetryDatabase` which has the configuration class `TelemetryDatabaseConfig`. These are the typical suffixes used to name databases in Catena.

### The configuration class

The `TelemetryDatabaseConfig` will inherit from `DatabaseConfig<>` and specify that it's for the `TelemetryDatabase`. Typically, it only needs the `Section` property and a constructor that passes the configuration to the underlying framework. You can include other fields with options for the database if necessary.

`Section` will indicate that the section/object in the Catena node configuration file that corresponds to the configuration for this database. **This field must be private.**

```csharp
public class TelemetryDatabaseConfig
    : DatabaseConfig<TelemetryDatabase>
{
    private const string Section = "Custom:Telemetry:Database";

    public TelemetryDatabaseConfig(IConfiguration configuration)
        : base(configuration.GetSection(Section)) { }
}
```

### The database class

The `TelemetryDatabase` will inherit from `IDatabaseAccessor`. This causes the class to be treated as a database. The Catena node will utilize the database configuration to create connections and perform migrations.

First, the constructor should take the specific database configuration created above and pass it to the underlying framework.

Second, `GetMigrationTags` must be implemented to allow the framework to find the appropriate migrations. The tag(s) returned must be unique. It is recommended to prefix the tag(s) with a studio or project name.

Third, implement the methods to access data. It is strongly recommended that these methods be asynchronous to accomodate the network and disk IO required for database operations.

When implementing database operations, it is useful to have named structures that services can use to access fields. An example of this is included below.

```csharp
public class TelemetryDatabase : IDatabaseAccessor
{
    public TelemetryDatabase(DatabaseConfig<TelemetryDatabase> config)
        : base(config) { }
    
    protected override string[] GetMigrationTags()
    {
        return ["MyTelemetry"];
    }
        
    // A structure that represents telemetry which can be used for reads or writes
    public struct Telemetry
    {
        public string Node { get; init; }
        public long Timestamp { get; init; }
        public string Metric { get; init; }
        public long Value { get; init; }
    }
    
    // Database methods
    
    // An example that takes individual values, and performs an insert using an anonymous object
    public async Task AddTelemetry(string node, long timestamp, string metric, long value)
    {
        // Get a database connection and start a transaction to write to the database
        using var connection = await GetDatabaseConnectionAsync();
        using var transaction = connection.BeginTransaction();

        await connection.ExecuteAsync(
            "INSERT INTO node_telemetry (node, timestamp, metric, value) VALUES (@node, @timestamp, @metric, @value);",
            new
            {
                node,
                timestamp,
                metric,
                value
            }
        );

        // Since no errors/exceptions occurred, commit the transaction
        transaction.Commit();
    }
    
    // An example that takes a telemetry object constructed by a service, and performs an insert (note the field names)
    public async Task AddTelemetry(Telemetry telemetry)
    {
        // Get a database connection and start a transaction to write to the database
        using var connection = await GetDatabaseConnectionAsync();
        using var transaction = connection.BeginTransaction();

        await connection.ExecuteAsync(
            "INSERT INTO node_telemetry (node, timestamp, metric, value) VALUES (@Node, @Timestamp, @Metric, @Value);",
            telemetry
        );

        // Since no errors/exceptions occurred, commit the transaction
        transaction.Commit();
    }
    
    // An example reading multiple records that match a filter
    public async Task<IEnumerable<Telemetry>> GetNodeTelemetry(string node, CancellationToken cancellationToken = default)
    {
        // Get a database connection
        using var connection = await GetDatabaseConnectionAsync(cancellationToken);
        // Perform a query that returns the specified type
        var telemetry = await connection.QueryAsync<Telemetry>(
            "SELECT node as Node, timestamp as Timestamp, metric as Metric, value as Value FROM node_telemetry WHERE node=@node;",
            new 
            {
                node
            }
        );
        return telemetry;
    }
}
```

## The migration class

The initial migration will be used to automatically create the necessary database tables.

This example migration will use the same tag as the database above using the `Tags` attribute: `[Tags("MyTelemetry")]`. This will ensure the migration is run to create the tables when that database is loaded for the first time.

The migration is also ordered as the first migration for this database using the `Migration` attribute: `[Migration(1)]`. Future migrations will be use higher numbers so migrations are run in the correct order.

Over time, additional migrations may be necessary to add new tables or automatically transform existing records. For better organization, it is recommended to prefix filenames with the order in which they are run and to keep them in a separate namespace. The example below may be in a file named `0001_Create.cs`.

```csharp
namespace MyTelemetryDatabase.Migrations
{
    [Tags("MyTelemetry")]
    [Migration(1)]
    public class Create : Migration {
        public override void Up()
        {
            Create.Table("node_telemetry")
                .WithColumn("node").AsString().NotNullable()
                .WithColumn("timestamp").AsInt64().NotNullable()
                .WithColumn("metric").AsString().NotNullable()
                .WithColumn("value").AsInt64().NotNullable()
        }

        public override void Down()
        {
            throw new NotImplementedException();
        }
    }
}
```