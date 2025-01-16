# How To Use The API Explorer

On the right hand side of this page, you will see a list of "Servers".

- *Mock server*: This server will return mock responses to all requests. It is best used when evaluating the shape of the Catena API.
- *Localhost*: This server will point at a locally running version of Catena. It is best used when you want to make real requests or to validate that Catena is properly running on your machine.
- *Custom Domain*: This server will point at any domain you specify with the _domain_ variable. It is best used when you have a version of Catena deployed to a live environment and you want to make real requests against it.

To configure which server is shown in example requests:
1. Select the "Try it" button on any API operation within the API explorer

[ ![api operation](/images/api-description/api-operation.png) ](/images/api-description/api-operation.png)


2. Select your environment

[ ![select environment](/images/api-description/select-environment.png) ](/images/api-description/select-environment.png)

3. If you want to point the API explorer to an instance of Catena you have deployed, select "Custom Domain" and configure the `domain` environment variable.

[ ![custom domain](/images/api-description/custom-domain.png) ](/images/api-description/custom-domain.png)

4. You're all set! This setting will be cached across all API operations exposed in these docs.