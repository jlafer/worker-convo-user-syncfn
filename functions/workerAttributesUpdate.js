exports.handler = async function(context, event, callback) {
  const functions = Runtime.getFunctions();
  const path = functions.helpers.path;
  const helpers = require(path);
  const {workerNameToIdentity} = helpers;

  const response = new Twilio.Response();
  response.appendHeader("Content-Type", "application/json");
  response.setStatusCode(204);
  response.setBody(null);

  const client = context.getTwilioClient();

  if (event.EventType !== 'worker.attributes.update') {
    console.log(`WARNING: ignoring unexpected event type: ${event.EventType}`);
    callback(null, response);
  }
  const {WorkerSid, WorkerName, WorkerAttributes, WorkerVersion} = event;
  const workerAttributes = JSON.parse(WorkerAttributes);
  const {image_url, full_name} = workerAttributes;
  if (!image_url || image_url === '') {
    console.log(`INFO: not updating User because worker's image_url not set`);
    return callback(null, response);
  }
  const encodedName = workerNameToIdentity(WorkerName);
  try {
    console.log(`reading user with identity = -${encodedName}-`);
    const user = await client.conversations.v1.users(encodedName).fetch();
    console.log(`read user ${user.friendlyName}`);
    await client.conversations.v1.users(user.sid)
      .update({
        attributes: JSON.stringify({gravatar_url: image_url})
      });
      console.log(`updated gravatar_url to ${image_url} for ${user.friendlyName}`);
      callback(null, response);
  }
  catch (err) {
    if (err.status === 404) {
      console.log(`INFO: User ${WorkerName} not found; will create`);
      await client.conversations.v1.users.create({
        identity: encodedName,
        fullName: full_name,
        attributes: JSON.stringify({gravatar_url: image_url})
      })
      callback(null, response);
    }
    else {
      console.error(`ERROR: while fetching Conversations User: ${WorkerName}`, err);
      callback(err, response);
    }
  }
};
