/*
  This function encodes a TR Worker.WorkerName to the format used by Flex when generating
  the User.identity for agents in Conversations.

  CAVEAT: this algorithm is based on observation and not on documentation of their encoding!
*/
exports.workerNameToIdentity = function(workerName) {
  return workerName.replace('@', '_40').replace('.', '_2E').replace('+', '_2B').replace('-', '_2D')
}
