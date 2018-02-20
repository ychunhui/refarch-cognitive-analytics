# Building the machine learning model using DSX in ICP

For a pure DSX, Db2 Warehouse and Spark cluster inside ICP approach the high level view looks like:

![](syst-ctx-dsx-spark.png)

The three datasource ingestions can be done with external tools, or combining the Remote table definition inside Db2 Warehouse, as explained in [this note]().

## Data Ingestion
### Customer data
The approach was to use Db2 Warehouse remote table to get access to the data. See [this note for detail](../data/README.md).

for the two other resources we used csv exports but we will provide another way with ETL or script.

### CallNotes
The CallNotes were loaded using the csv file export and load from file capabilities in Db2 Warehouse. ([See this note on how to similarly do csv loading](https://github.com/ibm-cloud-architecture/refarch-analytics/blob/master/docs/db2warehouse/README.md#loading-customer-sample-data)).  
The source for the `CallNotes.csv` file is under data folder. The IDs used in this file match the ID within the DB2 customer table.

### Campaign Responses

## Specific jupyter notebook
The Jupyter notebook is slightly different than the one developed within Watson Data Platform as the data sources are differents.

## Deploying to spark
The model

## Others
For deploying of DSX on ICP see [this detailed section](https://github.com/ibm-cloud-architecture/refarch-analytics/tree/master/docs/ICP)
