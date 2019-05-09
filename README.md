# Customer analysis with cognitive and analytics in hybrid cloud

This project is part of the 'IBM Hybrid Analytics and Big Data Architecture' reference architecture implementation, available at https://github.com/ibm-cloud-architecture/refarch-analytics.

The goal of this implementation is to deliver a reference implementation for data management and service integration to consume structured and unstructured data to assess customer attrition.

For better reading experience go to [the book view.](http://ibm-cloud-architecture.github.io/refarch-cognitive-analytics)



## Table of contents

* [Components](#components)
* [Build and Run](./docs/run.md)
* [Methodology](#methodology)
* [Deployment](#deployment)




## Deployment

There are multiple possible configurations for the deployment, depending of the use of public and private cloud and the legacy systems involved. For the back end we have two options: Z OS with DB2 and Z Connect, and Java based REST micro service and DB2.

For the machine learning, three options:
 1. ICP for Data with Spark cluster for model execution
 1. Watson Data Platform on IBM Cloud with Watson ML on IBM Cloud for the scoring service
 1. Watson Studio deploy on ICP cluster.

### Using data service as a Java micro service:

The first configuration deploys the `customer manager` micro service on IBM Cloud Private, accessing customer and account tables deployed on DB2 servers out side of ICP. API Connect is used to manage customer API product. The Web application, the customer service, and the churn risk scoring are deployed on ICP.

![](docs/deployment-cfg1.png)

* As machine learning discovery tasks running on Spark cluster are development activities and consume a lot of resources we propose to separate the DSX, Db2 warehouse and Spark cluster in its separate ICP instance. The decision to use separate cluster is really linked to the size of the dataset to process, and the execution frequency: with dedicated team of Data Scientist, with terra bytes of data.
* The runtime for cloud native applications and micro services is an ICP with HA and DR support.
* The scoring service is deployed on a Spark Cluster running on ICP runtime cluster.
* The DB2 instance runs on separate on-premise servers, to illustrate the use case of keeping existing infrastructure investments.
* Watson Cognitive services are on IBM Cloud, public offering,
* The datasource to persist the conversation data is Cloudant DB on Public Cloud.

### The ICP run time clustering

The cluster topology with some of the major ICP and solution components will look like the following diagram:

![](docs/icp-compo.png)

The dashed lines highlight the deployment concept of k8s. The Db2 warehouse is using external `Glusterfs` cluster for persisting data via the persistent volumes and persistent volume claim.

The spark cluster, master, spawner... are deployments inside ICP and installed via DSX Local.  
![](docs/icp-dsx-spark.png)

### Using Watson Data Platform

As an alternate to use DSX on ICP to develop the machine learning model, Data Scientist can use Watson Data platform to gather the data from multiple datasources like Amazon S3, CloudantDB, and from transactional data, persist in public object store and deploy the model once trained to Watson Machine learning.

![](docs/deployment-cfg3.png)

See [this note](docs/ml/README.md) for detail about the implementation of the analytic model, and the see the `WMLChurnServiceClient.js` code for the integration part.

### Using Data Service as Z Connect service

For Z OS deployment the solution looks like the diagram below, where the data service and DB2 are running on Z OS.

![](docs/Z/deployment-cfg2.png)

[This note](docs/Z/README.md) details the Z Connect implementation.



### Building this booklet locally

The content of this repository is written with markdown files, packaged with [MkDocs](https://www.mkdocs.org/) and can be built into a book-readable format by MkDocs build processes.

1. Install MkDocs locally following the [official documentation instructions](https://www.mkdocs.org/#installation).
2. `git clone https://github.com/ibm-cloud-architecture/refarch-cognitive-analytics.git` _(or your forked repository if you plan to edit)_
3. `cd refarch-cognitive-analytics`
4. `mkdocs serve`
5. Go to `http://127.0.0.1:8000/` in your browser.

### Pushing the book to GitHub Pages

1. Ensure that all your local changes to the `master` branch have been committed and pushed to the remote repository.
   1. `git push origin master`
2. Ensure that you have the latest commits to the `gh-pages` branch, so you can get others' updates.
	```bash
	git checkout gh-pages
	git pull origin gh-pages
	
	git checkout master
	```
3. Run `mkdocs gh-deploy` from the root refarch-cognitive-analytics directory.

--- 

## Contribute

As this implementation solution is part of the Event Driven architeture reference architecture, the [contribution policies](./CONTRIBUTING.md) apply the same way here.

**Contributors:**

* [Amaresh Rajasekharan](https://www.linkedin.com/in/amaresh-rajasekharan/)
* [Sandra Tucker](https://www.linkedin.com/in/sandraltucker/)
* [Sunil Dube](https://www.linkedin.com/in/sunil-dube-b861861/)
* [Zach Silverstein](https://www.linkedin.com/in/zsilverstein/)
* [Jerome Boyer](https://www.linkedin.com/in/jeromeboyer/) 
* [Sourav Mazumder](https://www.linkedin.com/in/souravmazumder/)

Please [contact me](mailto:boyerje@us.ibm.com) for any questions.
