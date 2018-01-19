# Implementation explanations
## Web Application
### Code explanation
Most of the interactions the end users are doing via the Web Browser are supported by [Angular 4 single page](http://angular.io) javascript library, with its `router` mechanism and the DOM rendering capabilities via directives and components. When there is a need to access data to the on-premise server for persistence, an AJAX call is done to server, and  the server will respond asynchronously later on. The components involved are presented in the figure below in a generic way

![Angular 2 App](ang-node-comp.png)

From an implementation point of view we are interested by the router, the controller and the services.

To clearly separate the codebase for front-end and back-end the `src/client` folder includes angular 4 code while `src/server` folder includes the REST api implemented with expressjs.

## Angular app
The application code follows the standard best practices for Angularjs development:
* unique index.html to support single page application
* use of modules to organize features
* use of component, html and css per feature page
* encapsulate calls to back end for front end server via service components.

We recommend beginners one Angular to follow the [product "tour of heroes" tutorial here.](https://angular.io/tutorial)

### Main Components
As traditional Angular 4 app, you need:
*  a `main.ts` script to declare and boostrap your application.
* a `app.module.ts` to declare all the components of the application and the URL routes declaration. Those routes are internal to the web browser. They are protected by a guard mechanism to avoid unlogged person to access the page. The following code declares 3 routes for the three main features of this application: display the main top navigation page, the customer page to access account, and the itSupport to access the chat bot user interface. The AuthGard assess if the user is known and logged, if not it is routed to the login page.
 ```
 const routes: Routes = [
   { path: 'home', component: HomeComponent,canActivate: [AuthGuard]},
   { path: 'log', component: LoginComponent },
   //canActivate: [AuthGuard]
   { path: 'itSupport', component: ConversationComponent,canActivate: [AuthGuard]},
   { path: 'customer', component: CustomersComponent,canActivate: [AuthGuard]},
   // otherwise redirect to home
   { path: '**', redirectTo: 'home' }
 ]
 ```
* an `app.component` to support the main page template where routing is done. This component has the header and footer of the HTML page and the placeholder directly to support sub page routing:
 ```
    <router-outlet></router-outlet>
 ```

### Home page
The home page is just a front end to navigate to the different features. It persists the user information in a local storage and uses the Angular router capability to map widget button action to method and route.
For example the following HTML page uses angular construct to link the button to the `itSupport()` method of the Home.component.ts
```html
<div class="col-md-6 roundRect" style="box-shadow: 3px 3px 1px #05870b; border-color: #05870b;">
      <h2>Support Help</h2>
      <p>Get help</p>
      <p><button (click)="itSupport()" class="btn btn-primary">Ask me</button></p>
</div>
```

the method delegates to the routing based on url
```javascript
itSupport(){
  this.router.navigate(['itSupport']);
}
```
### Conversation bot
For the conversation front end we are re-using the code approach of the conversation broker of the [Cognitive reference architecture implementation](https://github.com/ibm-cloud-architecture/refarch-cognitive-conversation-broker)
The same approach, service and component are used to control the user interface and to call the back end. The service does an HTTP POST of the newly entered message. The server code is under `server/routes/features/conversation.js`


### Account component
When the user selects to access the account information, the routing is going to the account component in `client/app/account` folder use a service to call the nodejs / expressjs REST services as illustrated in the code below:  

```javascript
export class CustomerService {
  private invUrl ='/api/c';

  constructor(private http: Http) {
  };

  getItems(): Observable<any>{
    return this.http.get(this.invUrl+'/customer')
         .map((res:Response) => res.json())
  }
}
```
The http component is injected at service creation, and the promise returned object is map so the response can be processed as json document.

An example of code using those service is the `account.component.ts`, which loads the account during component initialization phase.

```javascript
export class AccountComponent implements OnInit {

  constructor(private router: Router, private cService : CustomerService){
  }

  // Uses in init to load data and not the constructor.
  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('currentUser'));
    if(this.user && 'email' in this.user) {
      cService.getCustomerByEmail(this.user.email).subscribe(
          data => {
            this.customer=data;
          },
          error => {
            console.log(error);
          });
    }
  }
}
```


## Server code
The application is using nodejs and expressjs standard code structure. The code is under `server` folder.
### Conversation back end.
The script is in `server/route/features\conversation.js` and uses the Watson developer cloud library to connect to the remote service. This library encapsulates HTTP calls and simplify the interaction with the public service. The only thing that needs to be done for each chat bot is to add the logic to process the response, for example to get data from a backend, presents user choices in a form of buttons, or call remote service like a rule engine / decision service.

This module exports one function to be called by the API used by the front end. This API is defined in `api.js` as:
```javascript
app.post('/api/c/conversation',isLoggedIn,(req,res) => {
  conversation.itSupport(config,req,res)
});
```

The `conversation.itSupport()` method gets the message and connection parameter and uses the Watson API to transfer the call.

```javascript
conversation = watson.conversation({
        username: config.conversation.username,
        password: config.conversation.password,
        version: config.conversation.version,
        version_date: config.conversation.versionDate});

conversation.message(
    {
    workspace_id: wkid,
    input: {'text': message.text},
    context: message.context
    },
    function(err, response) {
      // add logic here to process the conversation response
    }
  )
```
It uses content of the conversation context to drive some of the routing mechanism. This code supports the following sequencing:

![](seq-diagram.png)
* As the user is enquiring about an existing ticket support, the conversation set the action variable to "search", and return a message in "A" that the system is searching for existing records. The web interface send back an empty message on behave of the user so the flow can continue.
* if the conversation context has a variable action set to "search", it calls the corresponding backend to get other data. Like a ticket management app. We did not implement the ticket management app, but just a mockup.
```javascript
if (req.body.context.action === "search" && req.body.context.item ==="UserRequests") {
  ticketing.getUserTicket(config,req.body.user.email,function(ticket){
      if (config.debug) {
          console.log('Ticket response: ' + JSON.stringify(ticket));
      }
      req.body.context["Ticket"]=ticket
      sendToWCSAndBackToUser(config,req,res);
  })}
```
The ticket information is returned to the conversation directly and the message response is built there.
* if the action is "recommend", the code can call a decision service deployed on IBM Cloud and execute business rules to compute the best recommendations/ actions. See example of such approach in [the project "ODM and Watson conversation"](https://github.com/ibm-cloud-architecture/refarch-cognitive-prod-recommendations)
* if in the conversation context the boolean `toneAnalyzer` is set to true, then any new sentence sent by the end user will be sent to Watson Tone Analyzer.
```javascript
if (req.body.context.toneAnalyzer && req.body.text !== "" ) {
    toneAnalyzer.analyzeSentence(config,req.body.text).then(function(toneArep) {
      // ...
    })
}
```
* When the result to the tone analyzer returns a tone as Sad or Frustrated then a call to a churn scoring service is performed.
```javascript
if (req.body.context["ToneAnalysisResponse"].tone_name === "Frustrated") {
  churnScoring.scoreCustomer(config,req,res,function(score){
      req.body.context["ChurnScore"]=score;
  })
}
sendToWCSAndBackToUser(config,req,res);
```
* when the churn score is greater than a value the call is routed to a human. This is done in the conversation dialog and the context action is set to Transfer
```javascript
if (req.body.context.action === "transfer") {
  console.log("Transfer to "+ req.body.context.item)
}
```
See also how the IBM Watson conversation is built to support this logic, in [this note.](wcs-support.md)

Finally this code can persist the conversation to a remote document oriented database. The code is in `persist.js` and a complete detailed explanation to setup this service is in [this note.](persist/chattranscripts.md)

### Customer back end
The customer API is defined in the server/routes/feature folder and uses request library to perform the call to the customer micro service API. The `config.json` file specifies the end point URL.

```javascript
getCustomerByEmail : function(config,req,res){
  var opts = buildOptions('GET','/customers/email/'+req.params.email,config);
  opts.headers['Content-Type']='multipart/form-data';
  processRequest(res,opts);
}

```
## Customer Micro service
The back end customer management function is a micro service in its separate repository, and the code implementation explanation can be read [here.](https://github.com/ibm-cloud-architecture/refarch-integration-services#code-explanation)
