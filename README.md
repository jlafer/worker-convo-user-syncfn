# jlafer/worker-convo-user-syncfn

This is a sample Twilio Serverless function that synchronizes the `image_url` attribute in TaskRouter Worker objects with a corresponding attribute in Conversations User objects. This can be useful because the two types of objects are not automatically synchronized. Because User objects can be accessed easily from their Conversations SDK apps, some Twilio customers make use of User attributes to do things like configure the appearance of their agents when chatting with customers in webchat; and Twilio Flex admin screens are used to update Worker attributes.

The `/workerAttributesUpdate` function is meant to be called whenever the `attributes` property of a TaskRouter Worker object is updated. This is useful whenever a user updates their avatar URL in Flex.

# Setup
Create and edit a `.env` file based on the example found in `.env.example`.
The `ATTRIBUTE_MAPPING` key is used to configure the mapping of the `Worker.attributes.image_url` attribute to a User attribute key. Any other attribute keys in the User object are left untouched when this function runs. In the example configuration, `Worker.attributes.image_url` is copied to `User.attributes.avatar_url` but this can be edited. Currently, only the `image_url` attribute key is copied from the Worker object.

# Usage
Execution of this function should be triggered by a webhook for the `worker.attributes.update` event. The webhook can be registered in the Twilio TaskRouter console at [Settings](https://console.twilio.com/us1/service/taskrouter/WS49d853e9fe7043f06726b1e1a2ac2aee/taskrouter-workspace-settings) under the `Event callbacks` section. Ensure the `Worker Attributes Updated` box is checked. If you have already registered a webhook for TaskRouter events you will need to incorporate the logic from this function into your current endpoint.

When a Worker's attributes are changed, this function can be triggered and it will update the corresponding `User` object in the Conversations API (and thus in Flex Conversations). If a user object doesn't yet exist, this function will create one.

# Test
To test this function locally, you can use the following Twilio Serverless Toolkit command, which will expose a `/workerAttributesUpdate` endpoint at `localhost:3000`.
```
twilio serverless:start
```

You will then need a way to expose your endpoint to the Twilio event webhook mechanism. This can be done with `ngrok` or similar tools.

# Deploy
To deploy this function to the Twilio Serverless environment, you can use the following Twilio Serverless Toolkit command and then update the TR event webhook to reference the generated Serverless endpoint URL.
```
twilio serverless:deploy
```

# Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.