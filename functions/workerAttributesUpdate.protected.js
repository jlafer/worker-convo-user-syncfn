const workerNameToIdentity = (workerName) =>
  workerName.replace('@', '_40').replace('.', '_2E').replace('+', '_2B').replace('-', '_2D');

exports.handler = async function(context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader("Content-Type", "application/json");
  response.setStatusCode(204);
  response.setBody({});

  const client = context.getTwilioClient();

  if (event.EventType !== 'worker.attributes.update') {
    console.warn(`WARNING: ignoring unexpected event type: ${event.EventType}`);
    callback(null, response);
  }

  const {ATTRIBUTE_MAPPING} = context;
  const attrMapping = (ATTRIBUTE_MAPPING) ? JSON.parse(ATTRIBUTE_MAPPING) : {image_url: 'gravatar_url'};
  const userUrlName = attrMapping.image_url;

  const {WorkerName, WorkerAttributes} = event;
  const workerAttributes = JSON.parse(WorkerAttributes);
  const {image_url, full_name} = workerAttributes;
  if (!image_url || image_url === '') {
    console.log(`INFO: not updating User ${full_name} because Worker's image_url not set`);
    return callback(null, response);
  }

  const identity = workerNameToIdentity(WorkerName);

  try {
    const user = await client.conversations.v1.users(identity).fetch();
    const {sid, friendlyName, attributes} = user;
    const userAttributes = JSON.parse(attributes);

    if (userAttributes[userUrlName] === image_url) {
      console.log(`INFO: not updating User ${friendlyName} because gravatar URL is unchanged`);
      return callback(null, response);
    }

    const updatedAttributes = JSON.stringify( {...userAttributes, [userUrlName]: image_url} );
    await client.conversations.v1.users(sid).update( {attributes: updatedAttributes} );
    console.log(`INFO: updated User.attributes.${userUrlName} to ${image_url} for ${friendlyName}`);
    callback(null, response);
  }
  catch (err) {
    if (err.status === 404) {
      console.log(`INFO: User for Worker ${WorkerName} not found; will create it`);
      await client.conversations.v1.users.create({
        identity,
        friendlyName: full_name,
        attributes: JSON.stringify( {[userUrlName]: image_url} )
      });
      callback(null, response);
    }
    else {
      console.error(`ERROR: while fetching Conversations User: ${WorkerName}`, err);
      callback(err, response);
    }
  }
};
