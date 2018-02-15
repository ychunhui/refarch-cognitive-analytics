# Building the machine learning model from DSX in ICP

For a pure DSX, Db2 Warehouse and Spark cluster inside ICP approach the high level view looks like:

![](syst-ctx-dsx-spark.png)

The three datasource ingestions can be done with external tools, or combining the Remote table definition inside Db2 Warehouse, as explained in [this note]().

## Data Ingestion
### Customer data
The approach was to use Db2 Warehouse remote table to get access to the data. See [this note for detail](../data/README.md).

### CallNotes

### Campaign Responses

## Specific jupyter notebook
The Jupyter notebook is slightly different than the one developed within Watson Data Platform as the data sources are differents.

## Deploying to spark
The model

## Others
For deploying of DSX on ICP see [this detailed section](https://github.com/ibm-cloud-architecture/refarch-analytics/tree/master/docs/ICP)
