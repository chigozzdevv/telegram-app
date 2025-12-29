does it work as specified here? Get the conversation list

Overview

Conversation, typically is the logical relationship automatically established by the ZIM SDK when a user sends a "single chat/group" message. Only the following message types can be used to establish a conversation:

Message TypeConversation TypesText Messages

One-to-one Conversation

Group Conversation

Rich Media Messages(Including image, audio, video, file)Combined MessagesCustom MessagesTip MessagesYou need to contact ZEGOCLOUD technical support to enable the group management type of Tip message feature. Afterwards, when a user creates a group, the ZIM SDK will convert this operation into a special type of message (Tip message) within the group conversation, resulting in the successful creation of the group conversation.

Explanation

If a user inserts a local message or saves a conversation draft before the conversation exists, a local conversation will be created. When the user gets the conversation list from the local database, these local sessions will be retrieved.

After a user logs in, the ZIM SDK automatically synchronizes the latest conversation list from the server. When the conversation list changes, the SDK notifies the user through callbacks. Meanwhile, users can also actively pull the conversation list from the local database; developers can also retrieve the complete conversation data of a specific user through server APIs.

You can obtain and display the one-on-one and group chat conversation lists in scenarios such as chats, gaming communities, and online consulting.


Listen for conversation list sync state changes

Before user login, please call the on interface and listen to the conversationSyncStateChanged callback to get the status of synchronizing the latest conversation list from the ZIM server.

Note

This callback is only received once after successful login or reconnection.

EnumerationEnum ValueEventSuggested ActionStarted0Conversation list synchronization started.You can use this event to start displaying "Loading" in the UI. We recommend you not to query the conversation list during conversation list synchronization, wait for the conversation list pull to complete before querying.Finished1Conversation list synchronization completed.You can use this event to stop displaying "Loading" in the UI. At this time, you can start querying the conversation list.Failed2Conversation list synchronization failed.You can use this event to stop displaying "Loading" in the UI.

zim.on('conversationSyncStateChanged', function(zim, { state }){     console.log('conversationSyncStateChanged', state)     if (state == 0) {         // Start synchronizing the conversation list from the server, and you can display "Loading" in the UI.     } else if (state == 1) {         // The conversation list synchronization from the server is completed, and you can cancel displaying "Loading" in the UI.     } else if (state == 2) {         // The conversation list synchronization from the server failed, and you can cancel displaying "Loading" in the UI, and record the failure upload log, etc.     } })

zim.on('conversationSyncStateChanged', function(zim, { state }){ 

console.log('conversationSyncStateChanged', state) 

if (state == 0) { 

// Start synchronizing the conversation list from the server, and you can display "Loading" in the UI. 

} else if (state == 1) { 

// The conversation list synchronization from the server is completed, and you can cancel displaying "Loading" in the UI. 

} else if (state == 2) { 

// The conversation list synchronization from the server failed, and you can cancel displaying "Loading" in the UI, and record the failure upload log, etc. 

} 

})

Listen for conversation changes

Before logging in, users should call the on method to listen for the callback conversationChanged, After login, the users will receive notifications of conversation changes when the following events happen:

CategoryEventEvent ValueZIMConversation PropertyBasic Conversation PropertiesConversation name changed.UpdatedconversationNameConversation avatar URL changed.conversationAvatarUrl

When a user sets a remark (friendAlias) for a friend, the ZIM SDK synchronously modifies the corresponding alias of the one-on-one conversation.

When a user sets a remark (groupAlias) for a group, the ZIM SDK will synchronize and modify the corresponding conversation alias for the group chat.

conversationAliasUnread message count changed, including changes caused by the user deleting unread messages?unreadMessageCountAdditional Conversation PropertiesUser sets/cancels a conversation as pinned.isPinnedUser sets notification status for a conversation.notificationStatusUser saves a conversation draft.draftThe user is mentioned in a conversation. If the user deletes the message that mentions them, they will also receive the event notification.mentionedInfoListLast Message in Conversation ChangesUser receives a new message.lastMessageUser sends a new message.The status or the content of the last message changes, or it is deleted by the user.Conversation Status ChangesUser has a new conversation.Added-

User voluntarily leaves/is kicked out of a group conversation.

Note

This assumes that the group conversation already exists (i.e., there are messages in the conversation).

Disabled-

Group conversation is dissolved.

Note

This assumes that the group conversation already exists (i.e., there are messages in the conversation).

Recipient user does not exist when sending a one-on-one message.User sends a message to a group they have not joined.In a multi-device login scenario, when a user deletes a conversation on one device, other devices will immediately receive a notification of this conversation event.Deleted-

At this time, you can get the conversation list based on your demands.

Note

Currently, the callback conversationChanged only supports notification of incremental changes of the conversation list in the local database and the conversation list on the ZIM server.

You need to maintain the array of conversation lists retrieved from the queryConversationList method, and based on current conversation updates, perform property changes, inserts, and sorted displays .

zim.on('conversationChanged', function(zim, { infoList }){     console.log('conversationChanged', infoList) })

zim.on('conversationChanged', function(zim, { infoList }){ 

console.log('conversationChanged', infoList) 

})

Get the conversation list

ZIM supports developers to call SDK interfaces to retrieve the current user's conversation list from the local database. It also supports making requests to the ZIM server to retrieve the complete conversation list of a specific user.

After fetching the conversation list, developers can use it to customize the UI display of the conversation list.

From the local database

Note

The ZIM SDK currently only supports fetching one-to-one and group conversation lists, and does not support fetching the room conversation list.

The conversation list is stored in the local database, and when getting the conversation list, relevant data will be retrieved from the local database.

It is recommended for you to use this feature on the first screen of the conversation page.

After login, if users want to know what conversations they have joined, they can call the queryConversationList method to query the conversation list.

To avoid the problem of pulling too many conversations at the same time, which takes a long time and causes slow loading of the conversation interface, you can customize the number of conversations by setting the ZIMConversationQueryConfig object for paging query when pulling conversations.

const config: ZIMConversationQueryConfig = {     // The conversation flag. If it is set to `null`, the flag is the latest conversation.     nextConversation: null,     // The number of conversations queried per page.     count: 20 };  // Pull the conversation list. zim.queryConversationList(config)     .then(function({ conversationList }){         // Query succeeded. You need to store and maintain the conversation objects in the array.     })     .catch(function(err){         // Query failed.     })

const config: ZIMConversationQueryConfig = { 

// The conversation flag. If it is set to `null`, the flag is the latest conversation. 

nextConversation: null, 

// The number of conversations queried per page. 

count: 20 

}; 

// Pull the conversation list. 

zim.queryConversationList(config) 

.then(function({ conversationList }){ 

// Query succeeded. You need to store and maintain the conversation objects in the array. 

}) 

.catch(function(err){ 

// Query failed. 

})

From the ZIM server

You can get a user's conversation list by calling the server API. For more details, please refer to the server API documentation Query conversation list' Manage unread message counts

Introduction

Through ZIM, you can get the unread message count for an individual conversation, acquire the total unread message count for all conversations, and clear the aforementioned values.


Get the unread message count of one conversation

ZIM supports actively or passively obtaining the number of unread messages of a conversation.

Actively obtaining

To actively obtain the number of unread messages in a conversation, first call queryConversationList or queryConversation to obtain the target conversation object. Then, you can use the unreadMessageCount property of the target conversation object to know the number of unread messages in that conversation.

Passively obtaining

Listen for the conversationChanged callback to obtain the unreadMessageCount property of a conversation and know the latest number of unread messages in that conversation. For more details, refer to Get conversation list - Listen for conversation changes.

Get the total unread message count of all conversations

To know how many unread messages you currently have after login, listen for the callback conversationTotalUnreadMessageCountUpdated of theon method.

After a successful login, the client user is notified of the update of the total number of unread messages through the callback in any of the following situations:

Immediately receive the total number of unread messages stored in the local database.

The user receives a new message and the message notification is enabled for the current conversation.

The user proactively clears the number of unread conversation messages. For details, see the chapter above Clear the number of unread conversation messages.

With this callback, you can adjust your app's UI display to remind the client user how many messages are currently unread.

typescript

zim.on('conversationTotalUnreadMessageCountUpdated', function(zim, { totalUnreadMessageCount }){     // Obtain the total number of unread messages of all conversations and display it on the UI. })

zim.on('conversationTotalUnreadMessageCountUpdated', function(zim, { totalUnreadMessageCount }){ 

// Obtain the total number of unread messages of all conversations and display it on the UI. 

})

Clear the unread message count of one conversation

To clear the unread message number of one conversation after getting the conversation list, call the clearConversationUnreadMessageCount method.

Because the ZIM SDK does not know when your app users should clear the unread count of the conversation, you need to call this method when your app users interact with specific pages. The following are some common scenarios to call this method:

Users click a conversation to enter the chat interface.

Users stay in the same conversation, and this method should be called every time the user receiving a new message.

Users mark a specified conversation as read in the conversation list interface.

titile="Sample code"

const conversationID = ''; const conversationType = 0; zim.clearConversationUnreadMessageCount(conversationID, conversationType)     .then(function(res){         // Operation succeeded.     })     .catch(function(err){         // Operation failed.     })

const conversationID = ''; 

const conversationType = 0; 

zim.clearConversationUnreadMessageCount(conversationID, conversationType) 

.then(function(res){ 

// Operation succeeded. 

}) 

.catch(function(err){ 

// Operation failed. 

})

Clear the total unread message count of all conversations

To clear the unread message numbers of all conversations after getting the conversation list, call the clearConversationTotalUnreadMessageCount method.

When you want to clear the unread message counts of all conversations and total unread conversation count, you can use this interface.

// Clear the unread message counts of all conversations zim.clearConversationTotalUnreadMessageCount()     .then(function(){         // Operation succeeded     })     .catch(function(err){         // Operation failed     })

// Clear the unread message counts of all conversations 

zim.clearConversationTotalUnreadMessageCount() 

.then(function(){ 

// Operation succeeded 

}) 

.catch(function(err){ 

// Operation failed 

})" Guides

Conversation

Delete conversation

Delete conversations

Introduction

ZIM supports users to delete a specific conversation or all conversations in the conversation list.

Delete a conversation

To delete a specified conversation after login, call the deleteConversation with the conversationID parameter.

Then, developers can obtain the result of the deletion through ZIMConversationDeletedResult.

Note

When deleting a specified conversation:

All messages in the conversation are not automatically deleted. If you need to delete both the conversation and all messages in the conversation, call the deleteAllMessage method. For details, see the chapter Delete all messages of the specified conversation of Delete messages.

If the conversation has unread messages, the total number of unread messages will be reduced and shown in the conversationTotalUnreadMessageCountUpdated callback. For details, see the chapter Get the number of unread messages above.

When a user logs in from multiple ends, only the end that initiates the deletion will receive ZIMConversationDeletedResult. If you want to know how other online clients of this user can obtain the deletion event, please refer to Multi-device login - Delete a single server conversation.

Sample code

// Delete a one-to-one chat. const conversationID = ''; const conversationType = 0; const config: ZIMConversationDeleteConfig = { isAlsoDeleteServerConversation: true }; zim.deleteConversation(conversationID, conversationType, config)     .then(function(res){         // Operation succeeded.     })     .catch(function(err){         // Operation failed.     })

// Delete a one-to-one chat. 

const conversationID = ''; 

const conversationType = 0; 

const config: ZIMConversationDeleteConfig = { isAlsoDeleteServerConversation: true }; 

zim.deleteConversation(conversationID, conversationType, config) 

.then(function(res){ 

// Operation succeeded. 

}) 

.catch(function(err){ 

// Operation failed. 

})

Delete all conversations

After the login, a user can delete all conversations in the conversation list by calling the deleteAllConversations interface.

Note

When a user logs in from multiple devices, the client that initiates the deletion only needs to focus on whether the operation was successful (or capture exceptions). Other online clients that need to synchronize the deletion event should refer to Multi-device login - Delete all server conversations.

// Delete all conversations const config: ZIMConversationDeleteConfig = { isAlsoDeleteServerConversation: true }; zim.deleteAllConversations(config)     .then(function(){         // Operation succeeded     })     .catch(function(err){         // Operation failed     })

// Delete all conversations 

const config: ZIMConversationDeleteConfig = { isAlsoDeleteServerConversation: true }; 

zim.deleteAllConversations(config) 

.then(function(){ 

// Operation succeeded 

}) 

.catch(function(err){ 

// Operation failed 

})" Guides

Conversation

Query a conversation

Query a conversation

Introduction

ZIM supports querying detailed information of a conversation by specifying the conversation ID.

Procedures

After the login, a user can use the queryConversation interface to specify the conversation ID and conversation type to get detailed information about the corresponding conversation, including the conversation name, unread count, and notification status.

// Query conversation information const conversationID = "xxx"; const conversationType = 0;  zim.queryConversation(conversationID, conversationType)     .then(function({ conversation }){         // Query successful, you need to save and maintain the conversation object in the array     })     .catch(function(err){         // Query failed     })

// Query conversation information 

const conversationID = "xxx"; 

const conversationType = 0; 

zim.queryConversation(conversationID, conversationType) 

.then(function({ conversation }){ 

// Query successful, you need to save and maintain the conversation object in the array 

}) 

.catch(function(err){ 

// Query failed 

})" Guides

Messaging

Send and receive messages

Send and receive messages

ZEGOCLOUD's In-app conversation (the ZIM SDK) provides the capability of message management, allowing you to send and receive one-to-one, group, in-room messages, query message history, delete messages, and more. With the message management feature, you can meet different requirements of various scenarios such as social entertainment, online shopping, online education, interactive live streaming, and more.

This document describes how to send and receive messages with the ZIM SDK.

Message types

Message TypeDescriptionFeature and ScenarioZIMCommandMessage(2)The signaling message whose content can be customized. A signaling message cannot exceed 5 KB in size, and up to 10 signaling messages can be sent per second per client.

Signaling messages, unable to be stored, are applicable to signaling transmission (for example, co-hosting, virtual gifting, and course materials sending) in scenarios with a higher concurrency, such as chat rooms and online classrooms.

Higher concurrency is supported, but it's unreliable: it does not ensure message delivery and order.

 API: sendMessageZIMBarrageMessage(20)On-screen comments in a chat room. An on-screen comment cannot exceed 5 KB in size, and there is no number limit on comments that can be sent per second per client.

On-screen comments, unable to be stored are usually unreliable messages that are sent at a high frequency and can be discarded.

A high concurrency is supported, but it's unreliable: it does not ensure message delivery.

API: sendMessage ZIMTextMessage(1)The text message. The default upper limit of message size is 2 KB. If necessary, please contact ZEGOCLOUD technical support for configuration, with a maximum size of up to 32 KB. Up to 10 text messages can be sent per second per client.

Text messages are reliable, in order, and able to be stored as historical messages. (For the storage duration, please refer to Pricing - Plan Fee - Plan Differences). It is applicable to one-to-one chats, group chats, and on-screen comments in chat rooms. After a room is disbanded, messages in it are not stored.

Images, files, audio, video: Typically used for sending rich media messages.

Custom message: Typically used for sending messages such as polls, chain messages, video cards, etc.

Multi-item Message: Typically used for sending a message including images and text.

API: sendMessage、replyMessage

ZIMMultipleMessage(10)Multi-item message, a message that can include multiple texts, up to 10 images, 1 file, 1 audio, 1 video, and 1 custom message.

Note

The total number of items should not exceed 20.

The size and format restrictions for images, audio, files, and videos are the same as those for the corresponding rich media message types.

ZIMImageMessage(11)Image message. Applicable formats includes JPG, PNG, BMP, TIFF, GIF, and WebP. The maximum size is 10 MB. Up to 10 image messages can be sent per second per client.ZIMFileMessage(12)File Message. A file message contains a file of any format and cannot exceed 100 MB in size. Up to 10 file messages can be sent per second per client.ZIMAudioMessage(13)Audio message. An audio message contains an MP3 or M4A audio of up to 300 seconds and cannot exceed 6 MB in size. Up to 10 audio messages can be sent per second per client.ZIMVideoMessage(14)A video message contains an MP4 or MOV video and cannot exceed 100 MB in size. Up to 10 video messages can be sent per second per client.

Note

To retrieve the width and height of the first video frame after a video is successfully sent, the video must be encoded in H.264 or H.265.

ZIMCombineMessage(100)For combined messages, there is no limit on message size, and the sending frequency of a single client is limited to 10 times/second.ZIMCustomMessage(200)You can customize the message type and parse the message without using the ZIM SDK. The default upper limit of message size is 2 KB. If necessary, please contact ZEGOCLOUD technical support for configuration, with a maximum size of up to 32 KB.

Send/Receive regular messages

Regular messages refer to the messages of the following message types: ZIMTextMessage and ZIMBarrageMessage.

Warning

To receive event callbacks (receive messages, get connection status, and receive a notification when Token is about to expire, etc.), you can set up the on method and listen for related events.

When receiving messages, you need to determine the message is a Text message ZIMTextMessage or a Command message ZIMCommandMessage because these two message types are based on the basic message class ZIMMessage. You need to convert the basic message class to a concrete message type and then retrieve the message content from the message field.

When a message is received, it can be sorted using the message's orderKey. The larger the orderKey, the newer the message. And the number of unread messages will be updated automatically upon receiving.

Send messages

The following process shows how Client A sends messages to Client B:


Client A and Client B create their own ZIM SDK instances, and set up an event handler on to listen for the callback on the result of message sending peerMessageReceived.

Client A and Client B log in to the ZIM SDK.

Client A calls the sendMessage method, and set the converversationType to ZIMConversationTypePeer to send a one-to-one message to Client B.

Client B listens for the peerMessageReceived callback to receive Client A's messages.

Warning

Currently, the ZIM SDK has the following restrictions for the sendMessage method:

Do not send messages to oneself: that is, toConversationID cannot be set to the caller's own user ID.

Do not sending blank messages: the message content cannot be empty or blank. When either of the above two cases occurs, the ZIM SDK will return error 6000001, indicating that the input parameters are incorrect.

SampleCode

// Send a text message to a one-to-one conversation // toConversationID is the ID of the conversation to which the message needs to be sent // In a one-on-one chat, the toConversationID is exactly the other party's userID. In a group conversation, the toConversationID is the groupID.In a room conversation, the toConversationID is the roomID. const toConversationID = ''; // The userID of the message receiver const conversationType = 0; // Applicable value: 0 (one-to-one), 1 (room), 2 (group). const config: ZIMMessageSendConfig = {      // Set the message priority.     // The applicable value is 1 (low, default), 2 (middle), 3 (high).     priority: 1, };  const notification: ZIMMessageSendNotification = {     onMessageAttached: function(message) {} }  const messageTextObj: ZIMMessage = {     type: 1,     message: 'xxxx' };  zim.sendMessage(messageTextObj, toConversationID, conversationType, config, notification)     .then(function ({ message }) {         // Sent successfully     })     .catch(function (err) {         // failed to send     });

// Send a text message to a one-to-one conversation 

// toConversationID is the ID of the conversation to which the message needs to be sent 

// In a one-on-one chat, the toConversationID is exactly the other party's userID. In a group conversation, the toConversationID is the groupID.In a room conversation, the toConversationID is the roomID. 

const toConversationID = ''; // The userID of the message receiver 

const conversationType = 0; // Applicable value: 0 (one-to-one), 1 (room), 2 (group). 

const config: ZIMMessageSendConfig = {  

// Set the message priority. 

// The applicable value is 1 (low, default), 2 (middle), 3 (high). 

priority: 1, 

}; 

const notification: ZIMMessageSendNotification = { 

onMessageAttached: function(message) {} 

} 

const messageTextObj: ZIMMessage = { 

type: 1, 

message: 'xxxx' 

}; 

zim.sendMessage(messageTextObj, toConversationID, conversationType, config, notification) 

.then(function ({ message }) { 

// Sent successfully 

}) 

.catch(function (err) { 

// failed to send 

});

Receive messages

Note

To send a message, call the sendMessage method and pass the appropriate conversationType based on the conversation type.

To receive a message:

For one-on-one conversations, use the peerMessageReceived callback.

For room conversations, use the roomMessageReceived callback.

For group conversations, use the groupMessageReceived callback.

// Callback for receiving the one-to-one message. zim.on('peerMessageReceived', function (zim, { messageList, info, fromConversationID }) {     console.log(messageList, info, fromConversationID); });  // Callback for receiving the group message. zim.on('groupMessageReceived', function (zim, { messageList, info, fromConversationID }) {     console.log(messageList, info, fromConversationID); });  // Callback for receiving the in-room message. zim.on('roomMessageReceived', function (zim, { messageList, info, fromConversationID }) {     console.log(messageList, info, fromConversationID); });

// Callback for receiving the one-to-one message. 

zim.on('peerMessageReceived', function (zim, { messageList, info, fromConversationID }) { 

console.log(messageList, info, fromConversationID); 

}); 

// Callback for receiving the group message. 

zim.on('groupMessageReceived', function (zim, { messageList, info, fromConversationID }) { 

console.log(messageList, info, fromConversationID); 

}); 

// Callback for receiving the in-room message. 

zim.on('roomMessageReceived', function (zim, { messageList, info, fromConversationID }) { 

console.log(messageList, info, fromConversationID); 

});

Send messages that do not contribute to the unread message number

When sending messages by calling sendMessage, you can set the message to not contribute to the unread count by using the following parameters:

disableUnreadMessageCount：

true : The message will not be counted as unread messages.

false : The message will be counted as unread messages.

Note

Only ZIM SDK version 2.23.0 or higher supports sending messages that do not contribute to the unread message number.

// The following is an example code for sending messages that do not contribute to the unread message number in a one-to-one conversation: const toConversationID = ''; // The other userID const conversationType = 0; // Conversation type, value for One-on-one: 0, Room: 1, Group: 2 const config: ZIMMessageSendConfig = {      priority: 1, // Set the message priority, value for Low: 1 (default), Medium: 2, High: 3 // !mark     disableUnreadMessageCount: true, // Set the message to not contribute to the unread message number };  const notification: ZIMMessageSendNotification = {     onMessageAttached: (message: ZIMMessage) => {} }  const messageTextObj: ZIMMessage = {     type: 1,     message: 'xxxx', };  zim.sendMessage(messageTextObj, toConversationID, conversationType, config, notification)     .then((res: ZIMMessageSentResult) => {         // Sent successfully     })     .catch((err: ZIMError) => {         // Send failed     });

// The following is an example code for sending messages that do not contribute to the unread message number in a one-to-one conversation: 

const toConversationID = ''; // The other userID 

const conversationType = 0; // Conversation type, value for One-on-one: 0, Room: 1, Group: 2 

const config: ZIMMessageSendConfig = {  

priority: 1, // Set the message priority, value for Low: 1 (default), Medium: 2, High: 3 

disableUnreadMessageCount: true, // Set the message to not contribute to the unread message number 

}; 

const notification: ZIMMessageSendNotification = { 

onMessageAttached: (message: ZIMMessage) => {} 

} 

const messageTextObj: ZIMMessage = { 

type: 1, 

message: 'xxxx', 

}; 

zim.sendMessage(messageTextObj, toConversationID, conversationType, config, notification) 

.then((res: ZIMMessageSentResult) => { 

// Sent successfully 

}) 

.catch((err: ZIMError) => { 

// Send failed 

});

Receive messages that do not contribute to the unread message number

The callback interface for receiving messages that do not contribute to the unread count is the same as the callback interface for receiving normal messages. Please refer to Send & Receive messages - Receive messages for the specific interface.

After receiving the message, developers can implement the corresponding functions based on the business logic.

Resend messages

Note

To use this feature, please integrate ZIM SDK version 2.20.0 or higher.

When a user sends one-on-one or group chat messages and the network disconnects:

If the network recovers within 30 seconds, the ZIM SDK will automatically resend the message.

If the network does not recover within 30 seconds, the message sending fails.

To configure the network recovery waiting time, please contact ZEGOCLOUD Technical Support.

When automatic resend fails, the user can manually resend the message after the network is restored. At this point, call the sendMessage interface again, re-enter the failed message object, and set the parameter config.isRetrySend to true.

After a manual resend succeeds, the message will be reordered to the current last position. For example: the current message order is A (successful), B (failed), C (successful). After resending message B successfully, the order becomes A, C, B.

Note

When the ZIM SDK automatically resends a message, if the user simultaneously attempts a manual resend, the interface call will fail, and the ZIM SDK will prompt a parameter error.

Sample Code

// Resend a text message in a one-to-one conversation  const toConversationID = ''; // Opponent userID const conversationType = 0; // Conversation type, value for One-on-one: 0, Room: 1, Group: 2 const config: ZIMMessageSendConfig = {      priority: 1, // Set the message priority, value for Low: 1 (default), Medium: 2, High: 3 // !mark     isRetrySend: true, // Needs to be true, indicating that this message is resent };  const notification: ZIMMessageSendNotification = {     onMessageAttached: function(message) {} }  const messageTextObj: ZIMMessage = {}; // Obtain the failed message by the queryHistoryMessage interface  zim.sendMessage(messageTextObj, toConversationID, conversationType, config, notification) // !mark     .then(function ({ message }) {         // Send successfully     })     .catch(function (err) {         // Send failed     });

// Resend a text message in a one-to-one conversation 

const toConversationID = ''; // Opponent userID 

const conversationType = 0; // Conversation type, value for One-on-one: 0, Room: 1, Group: 2 

const config: ZIMMessageSendConfig = {  

priority: 1, // Set the message priority, value for Low: 1 (default), Medium: 2, High: 3 

isRetrySend: true, // Needs to be true, indicating that this message is resent 

}; 

const notification: ZIMMessageSendNotification = { 

onMessageAttached: function(message) {} 

} 

const messageTextObj: ZIMMessage = {}; // Obtain the failed message by the queryHistoryMessage interface 

zim.sendMessage(messageTextObj, toConversationID, conversationType, config, notification) 

.then(function ({ message }) { 

// Send successfully 

}) 

.catch(function (err) { 

// Send failed 

});

Send/Receive rich media content

The ZIM SDK now supports sending and receiving messages of different rich media types, such as images, audio, video, and files. To send and receive rich media content, refer to the following:

To send rich media content after login, the message type (image, file, audio, or video) first and the conversation type (one-to-one, room, group) should be specified.

To receive rich media content, the recipient should listen for relevant event callbacks related to the conversation type after logging in. This will enable them to receive message events.

Send rich media content

To send rich media content after login, call the sendMessage method, and specify the message type (image, file, audio, video), the conversation type (one-to-one, room, group), and message related configurations as needed.

Warning

When sending rich media content, the file path to be sent must be in UTF-8 encoding format.

To send rich media content to a room/group, the sender must be in the room/group.

Note

Local images (sent via fileLocalPath) Images will be uploaded to ZEGOCLOUD servers, and a fileDownloadURL will be automatically generated (the sender can obtain this URL in the message sent success callback via the ZIMMessage object). Both the sender and receiver can download the original image using the fileDownloadURL (even if the sender deletes the local image, it can still be retrieved via this URL).

Network images (sent directly via fileDownloadURL) These are not relayed through ZEGOCLOUD servers. The SDK only transmits the URL and does not generate a new server-side download address. Ensure the URL is a publicly accessible and valid address. Receivers need to handle image loading themselves (e.g., caching, preventing invalidation).

If the sender deletes the original image from their phone after sending a local image, they can re-download it using the fileDownloadURL.

To reduce server storage costs, or if the image needs to be updated in real-time (e.g., a dynamically generated poster), you can directly send the network image URL.

Example of sending a local file

// Sending Rich Media Message with a local file - one-to-one conversation  const conversationID = 'xxxx'; const config = { priority: 1 }; const notification = {     onMessageAttached: function(message) {         //      },     onMediaUploadingProgress: function(message, currentFileSize, totalFileSize) {         // You can display the upload progress here on the UI.     } };  function sendMessage(file) {     /* The following code is for demonstration purposes only: please create the corresponding `media message object` based on the demands and file type in actual development */      // For an image      let mediaMessageObj = {         fileLocalPath: file,         type: 11,     };      // For a file     mediaMessageObj = {         fileLocalPath: file,         type: 12,     };      // For an audio     mediaMessageObj = {         fileLocalPath: file,         type: 13,         audioDuration: 100, // Required: Audio duration in seconds     };         // For a video     mediaMessageObj = {         fileLocalPath: file,         type: 14,         videoDuration: 100, // Required: Video duration in seconds     };        zim.sendMessage(mediaMessageObj, conversationID, 0, config, notification);   }  const input = document.createElement('input'); input.type = 'file'; input.onchange = function() {     sendMessage(this.files[0]); }

// Sending Rich Media Message with a local file - one-to-one conversation 

const conversationID = 'xxxx'; 

const config = { priority: 1 }; 

const notification = { 

onMessageAttached: function(message) { 

//  

}, 

onMediaUploadingProgress: function(message, currentFileSize, totalFileSize) { 

// You can display the upload progress here on the UI. 

} 

}; 

function sendMessage(file) { 

/* The following code is for demonstration purposes only: please create the corresponding `media message object` based on the demands and file type in actual development */ 

// For an image  

let mediaMessageObj = { 

fileLocalPath: file, 

type: 11, 

}; 

// For a file 

mediaMessageObj = { 

fileLocalPath: file, 

type: 12, 

}; 

// For an audio 

mediaMessageObj = { 

fileLocalPath: file, 

type: 13, 

audioDuration: 100, // Required: Audio duration in seconds 

}; 

// For a video 

mediaMessageObj = { 

fileLocalPath: file, 

type: 14, 

videoDuration: 100, // Required: Video duration in seconds 

}; 

zim.sendMessage(mediaMessageObj, conversationID, 0, config, notification);   

} 

const input = document.createElement('input'); 

input.type = 'file'; 

input.onchange = function() { 

sendMessage(this.files[0]); 

}

Example of sending an online file

// Sending Rich Media Message with an online file - one-to-one conversation /* When sending an online file message, the ZIM SDK only passes relevant fields to the backend, and the ZIM backend does not save the online file. */ // conversationID is the ID of the conversation to which the message needs to be sent // In a one-on-one chat, the toConversationID is exactly the other party's userID.In a group conversation, the toConversationID is the groupID.In a room conversation, the toConversationID is the roomID. const conversationID = 'xxxx'; const config: ZIMMessageSendConfig = { priority: 1 }; const notification: ZIMMessageSendNotification = {     onMessageAttached: function(message) {} };  /* The following code is for demonstration purposes only: please create the corresponding `media message object` based on the requirements and file type in actual development */  // For an image let mediaMessageObj: ZIMMessage = {     fileDownloadUrl: 'https://xxxx.jpeg', // Original Image     thumbnailDownloadUrl: 'https://xxxx-thumbnail.jpeg', // Thumbnail     largeImageDownloadUrl: 'https://xxxx-large.jpeg', // Large Image     type: 11, };  // For a file mediaMessageObj = {     fileDownloadUrl: 'https://xxxx.pdf',     type: 12, };  // For an audio mediaMessageObj = {     fileDownloadUrl: 'https://xxxx.mp3',     type: 13,     audioDuration: 100, // Required: Audio duration in seconds };  // For a video mediaMessageObj = {     fileDownloadUrl: 'https://xxxx.mp4',     videoFirstFrameDownloadUrl: 'https://xxxx-firstframe.jpeg', // The first frame image     type: 14,     videoDuration: 100, // Required: Video duration in seconds };    zim.sendMessage(mediaMessageObj, conversationID, 0, config, notification);

// Sending Rich Media Message with an online file - one-to-one conversation 

/* When sending an online file message, the ZIM SDK only passes relevant fields to the backend, and the ZIM backend does not save the online file. */ 

// conversationID is the ID of the conversation to which the message needs to be sent 

// In a one-on-one chat, the toConversationID is exactly the other party's userID.In a group conversation, the toConversationID is the groupID.In a room conversation, the toConversationID is the roomID. 

const conversationID = 'xxxx'; 

const config: ZIMMessageSendConfig = { priority: 1 }; 

const notification: ZIMMessageSendNotification = { 

onMessageAttached: function(message) {} 

}; 

/* The following code is for demonstration purposes only: please create the corresponding `media message object` based on the requirements and file type in actual development */ 

// For an image 

let mediaMessageObj: ZIMMessage = { 

fileDownloadUrl: 'https://xxxx.jpeg', // Original Image 

thumbnailDownloadUrl: 'https://xxxx-thumbnail.jpeg', // Thumbnail 

largeImageDownloadUrl: 'https://xxxx-large.jpeg', // Large Image 

type: 11, 

}; 

// For a file 

mediaMessageObj = { 

fileDownloadUrl: 'https://xxxx.pdf', 

type: 12, 

}; 

// For an audio 

mediaMessageObj = { 

fileDownloadUrl: 'https://xxxx.mp3', 

type: 13, 

audioDuration: 100, // Required: Audio duration in seconds 

}; 

// For a video 

mediaMessageObj = { 

fileDownloadUrl: 'https://xxxx.mp4', 

videoFirstFrameDownloadUrl: 'https://xxxx-firstframe.jpeg', // The first frame image 

type: 14, 

videoDuration: 100, // Required: Video duration in seconds 

}; 

zim.sendMessage(mediaMessageObj, conversationID, 0, config, notification);

Example of sending a recorded audio file message

// HTTPS protocol is required. if (navigator.mediaDevices) {     const chunks = [];      navigator.mediaDevices         .getUserMedia({ audio: true })         .then((stream) => {             const duration = 10; // Duration of recording, in seconds             const mediaRecorder = new MediaRecorder(stream);              mediaRecorder.onstop = function (e) {                 // After recording, send the audio message.                 // conversationID is the ID of the conversation to which the message needs to be sent                 // In a one-on-one chat, the toConversationID is exactly the other party's userID.In a group conversation, the toConversationID is the groupID.In a room conversation, the toConversationID is the roomID.                 const conversationID = 'xxxx';                 const config = { priority: 1 };                 const notification = {                     onMessageAttached: function(message) {                         //                      },                     onMediaUploadingProgress: function(message, currentFileSize, totalFileSize) {                         // You can display the upload progress here on the UI.                     }                 };                  const mediaMessageObj = {                     fileLocalPath: new File(chunks, 'file-name-xxxx.mp3'),                     type: 13,                     audioDuration: duration                 };                      zim.sendMessage(mediaMessageObj, conversationID, 0, config, notification)                     .then((res) => {                         // Sent successfully                     })                     .catch((err) => {                         // Failed to send                     });                  // Reset the chunks                   chunks = [];             };              mediaRecorder.ondataavailable = function (e) {                 chunks.push(e.data);             };              // Start the recording             mediaRecorder.start();             // Stop the recording             setTimeout(() => mediaRecorder.stop(), duration * 1000);         })         .catch((err) => {             console.log('The following error occured: ' + err);         }); }

// HTTPS protocol is required. 

if (navigator.mediaDevices) { 

const chunks = []; 

navigator.mediaDevices 

.getUserMedia({ audio: true }) 

.then((stream) => { 

const duration = 10; // Duration of recording, in seconds 

const mediaRecorder = new MediaRecorder(stream); 

mediaRecorder.onstop = function (e) { 

// After recording, send the audio message. 

// conversationID is the ID of the conversation to which the message needs to be sent 

// In a one-on-one chat, the toConversationID is exactly the other party's userID.In a group conversation, the toConversationID is the groupID.In a room conversation, the toConversationID is the roomID. 

const conversationID = 'xxxx'; 

const config = { priority: 1 }; 

const notification = { 

onMessageAttached: function(message) { 

//  

}, 

onMediaUploadingProgress: function(message, currentFileSize, totalFileSize) { 

// You can display the upload progress here on the UI. 

} 

}; 

const mediaMessageObj = { 

fileLocalPath: new File(chunks, 'file-name-xxxx.mp3'), 

type: 13, 

audioDuration: duration 

}; 

zim.sendMessage(mediaMessageObj, conversationID, 0, config, notification) 

.then((res) => { 

// Sent successfully 

}) 

.catch((err) => { 

// Failed to send 

}); 

// Reset the chunks   

chunks = []; 

}; 

mediaRecorder.ondataavailable = function (e) { 

chunks.push(e.data); 

}; 

// Start the recording 

mediaRecorder.start(); 

// Stop the recording 

setTimeout(() => mediaRecorder.stop(), duration * 1000); 

}) 

.catch((err) => { 

console.log('The following error occured: ' + err); 

}); 

}

Callback for the sending progress of rich media content

You will be notified of the sending progress of rich media content through the callback onMediaUploadingProgress.

function onMediaUploadingProgress(message: ZIMMediaMessage, currentFileSize: number, totalFileSize: number);

function onMediaUploadingProgress(message: ZIMMediaMessage, currentFileSize: number, totalFileSize: number);

Among which:

message: The content of the message being sent.

currentFileSiz: The size of the message that has been sent.

totalFileSize: The overall size of the message sent.

Receive rich media content

To receive the rich media content messages, do the following: After logging in, users should listen for the following callbacks based on the conversation type (one-to-one, room, group): peerMessageReceived, roomMessageReceived, groupMessageReceived, to receive the events of rich media messages. From the events, the URL of rich media content can be obtained directly.

Send/Receive signaling messages

The ZIM SDK now supports you to send and receive signaling messages. To do that, you can call the ZIMCommandMessage to define the message type you want to send, for example, your location information.

Note

This message type does not support offline push and local storage.

The following shows how to send custom messages to a specified user.

Send signaling messages

// Send signaling messages to a specified user. // toConversationID is the ID of the conversation to which the message needs to be sent // In a one-on-one chat, the toConversationID is exactly the other party's userID. In a group conversation, the toConversationID is the groupID.In a room conversation, the toConversationID is the roomID. const toConversationID = ''; // The recipient's user ID. const conversationType = 0; // 0: one-to-one, 1: room, 2: group const config = {      priority: 1, // 1: low (default), 2: middle, 3: high };  const notification = {     onMessageAttached: function(message) {} }  // Here, a JSON string is used as an example, and the string needs to be converted to a Uint8Array.   // When `peerMessageReceived` receives a message with type 2, the Uint8Array needs to be converted back to a JSON string.   const jsonText = JSON.stringify({ id: '111', name: 'bob' }); const uint8Array = new Uint8Array(Array.from(unescape(encodeURIComponent(jsonText))).map((val) => val.charCodeAt(0)));  const messageCommandObj = { type: 2, message: uint8Array };  zim.sendMessage(messageCommandObj, toConversationID, conversationType, config, notification)     .then(function ({ message }) {         // Sent successfully     })     .catch(function (err) {         // Failed to send     });

// Send signaling messages to a specified user. 

// toConversationID is the ID of the conversation to which the message needs to be sent 

// In a one-on-one chat, the toConversationID is exactly the other party's userID. In a group conversation, the toConversationID is the groupID.In a room conversation, the toConversationID is the roomID. 

const toConversationID = ''; // The recipient's user ID. 

const conversationType = 0; // 0: one-to-one, 1: room, 2: group 

const config = {  

priority: 1, // 1: low (default), 2: middle, 3: high 

}; 

const notification = { 

onMessageAttached: function(message) {} 

} 

// Here, a JSON string is used as an example, and the string needs to be converted to a Uint8Array.   

// When `peerMessageReceived` receives a message with type 2, the Uint8Array needs to be converted back to a JSON string.   

const jsonText = JSON.stringify({ id: '111', name: 'bob' }); 

const uint8Array = new Uint8Array(Array.from(unescape(encodeURIComponent(jsonText))).map((val) => val.charCodeAt(0))); 

const messageCommandObj = { type: 2, message: uint8Array }; 

zim.sendMessage(messageCommandObj, toConversationID, conversationType, config, notification) 

.then(function ({ message }) { 

// Sent successfully 

}) 

.catch(function (err) { 

// Failed to send 

});

Receive signaling messages

// Receive signaling messages. zim.on('peerMessageReceived', function (zim, { messageList, info, fromConversationID }) {     console.log(messageList, info, fromConversationID);     messageList.forEach(function (msg) {         // Here, take the JSON string as an example, which needs to be converted to Uint8Array.         if (msg.type == 2) {             const uint8Array = msg.message;             const jsonText = decodeURIComponent(escape(String.fromCharCode(...Array.from(uint8Array))));             const jsonObj = JSON.parse(jsonText);             console.log('peerMessageReceived', jsonObj);         }     }) });

// Receive signaling messages. 

zim.on('peerMessageReceived', function (zim, { messageList, info, fromConversationID }) { 

console.log(messageList, info, fromConversationID); 

messageList.forEach(function (msg) { 

// Here, take the JSON string as an example, which needs to be converted to Uint8Array. 

if (msg.type == 2) { 

const uint8Array = msg.message; 

const jsonText = decodeURIComponent(escape(String.fromCharCode(...Array.from(uint8Array)))); 

const jsonObj = JSON.parse(jsonText); 

console.log('peerMessageReceived', jsonObj); 

} 

}) 

});

Send/Receive custom messages

The ZIM SDK supports developers in implementing the sending and receiving of custom message types. Developers can define their own message types using the ZIMCustomMessage object, such as voting, chain, video card, and more. Developers can follow these steps to implement the sending and receiving of custom messages.

Note

Only ZIM SDK version 2.8.0 and above supports sending custom type messages, receiving and viewing the content of custom type messages.

If the SDK version of the receiving end is between [2.0.0, 2.8.0), the custom message can be received, but the message type will be displayed as unknown and the information content cannot be obtained. To get this message, please upgrade the SDK to version 2.8.0 or above.

If the SDK version of the receiving end is version 1.x.x, you cannot receive custom messages or unknown messages.

Send custom messages

The interface used to send custom messages is sendMessage, which is the same as the interface used to send regular messages. Developers can refer to Send & Receive messages - Send messages to learn about this interface Parameter details.

Developers need to define custom type messages through the ZIMCustomMessage object.

// Send a custom message to a specified user  // Pass in the userID of the message receiver // toConversationID is the ID of the conversation to which the message needs to be sent // In a one-on-one chat, the toConversationID is exactly the other party's userID. In a group conversation, the toConversationID is the groupID.In a room conversation, the toConversationID is the roomID. const toConversationID = "xxxx"; const conversationType = 0; // 0： One-to-one; 1: Room，2: Group // Advanced settings const config: ZIMMessageSendConfig = {      priority: 1, // Message priority: 1: Low (default); 2: Medium; 3: High. };  const notification: ZIMMessageSendNotification = {     onMessageAttached: function(message) {} }  const zimCustomMessage: ZIMMessage = {     type: 200,     message: 'xxxx', // Text of custom message     subType: 100, // Specific custom message type     searchedContent: 'xxxx'  };  zim.sendMessage(zimCustomMessage, toConversationID, conversationType, config, notification)     .then(function ({ message }) {         // Sent successfully     })     .catch(function (err) {         // Failed to send     });

// Send a custom message to a specified user 

// Pass in the userID of the message receiver 

// toConversationID is the ID of the conversation to which the message needs to be sent 

// In a one-on-one chat, the toConversationID is exactly the other party's userID. In a group conversation, the toConversationID is the groupID.In a room conversation, the toConversationID is the roomID. 

const toConversationID = "xxxx"; 

const conversationType = 0; // 0： One-to-one; 1: Room，2: Group 

// Advanced settings 

const config: ZIMMessageSendConfig = {  

priority: 1, // Message priority: 1: Low (default); 2: Medium; 3: High. 

}; 

const notification: ZIMMessageSendNotification = { 

onMessageAttached: function(message) {} 

} 

const zimCustomMessage: ZIMMessage = { 

type: 200, 

message: 'xxxx', // Text of custom message 

subType: 100, // Specific custom message type 

searchedContent: 'xxxx'  

}; 

zim.sendMessage(zimCustomMessage, toConversationID, conversationType, config, notification) 

.then(function ({ message }) { 

// Sent successfully 

}) 

.catch(function (err) { 

// Failed to send 

});

Receive custom messages

The callback interface for receiving custom messages is the same as the callback interface for receiving regular messages. Please refer to Send & Receive messages - Receive messages for details on the specific interface.

The following is an example code for receiving custom messages in a one-to-one conversation:

// Receive a custom messages in a one-to-one conversation zim.on('peerMessageReceived', function (zim, { messageList, info, fromConversationID }) {     console.log(messageList, info, fromConversationID);     messageList.forEach(function (msg) {         // When receiving a custom message         if (msg.type == 200) {         }     }) });

// Receive a custom messages in a one-to-one conversation 

zim.on('peerMessageReceived', function (zim, { messageList, info, fromConversationID }) { 

console.log(messageList, info, fromConversationID); 

messageList.forEach(function (msg) { 

// When receiving a custom message 

if (msg.type == 200) { 

} 

}) 

});

Send/Receive multi-item messages

ZIM SDK supports sending multiple types of content in a single message, such as text, images, and more. This type of message is referred to as a "multi-message. You can define this type of message by using the ZIMCustomMessage object.

Note

Only ZIM SDK version 2.19.0 and above supports sending multi-item messages, receiving and viewing the content of multi-item messages.

If the SDK version of the receiving end is between [2.0.0, 2.19.0), the multi-item message can be received, but the message type will be displayed as unknown and the information content cannot be obtained. To get this message, please upgrade the SDK to version 2.19.0 or above.

If the SDK version of the receiving end is version 1.x.x, you cannot receive multi-item messages or unknown messages.


Send multi-item messages

After the user logs in successfully, they can send 1 message containing various types of content (such as text, images, audio, video, files, and custom messages) using the ZIMMultipleMessage object in one-to-one chats, room chats, or group chats via the sendMessage interface.

You can use the multipleMediaUploadingProgress callback to receive notifications about the upload progress of rich media files in the multi-item message. This callback provides the following fields:

currentFileSize: Total size of the uploaded files, in bytes.

totalFileSize: Total size of all rich media files in the multi-item message, in bytes.

messageInfoIndex: The index of the currently uploading file in the ZIMMultipleMessage array.

currentIndexFileSize: Uploaded size of the currently uploading file, in bytes.

totalIndexFileSize: Actual size of the currently uploading file, in bytes.

These fields can be used to calculate the overall upload progress and the progress of the current file being uploaded:

Total upload progress = currentFileSize / totalFileSize.

Current file upload progress = currentIndexFileSize / totalIndexFileSize.

// The method to select a local file let file = null; // The file object to be uploaded const input = document.createElement('input'); input.type = 'file'; input.onchange = function() {     file = this.files[0]; }

// The method to select a local file 

let file = null; // The file object to be uploaded 

const input = document.createElement('input'); 

input.type = 'file'; 

input.onchange = function() { 

file = this.files[0]; 

}

// Send a multi-item message in a one-to-one conversation  // Pass in the userID of the message receiver const toConversationID = "xxxx"; // Advanced configuration for sending messages. const conversationType = 0; // 0: One-to-one; 1: Room; 2: Group const config: ZIMMessageSendConfig = {      priority: 1, // Message Priority, 1: low (default), 2: medium, 3: high };  const notification: ZIMMessageSendNotification = {     onMessageAttached: function(message) {         //      },     onMultipleMediaUploadingProgress: function(         message,         currentFileSize,      // Total size of uploaded files in bytes (B). For example, if 20,971,520 Byte has been uploaded, this value will be 20,971,520.         totalFileSize,        // Total file size in bytes (B). For example, if the total file size is 104,857,600 Byte, this value will be 104,857,600.         messageInfoIndex,     // The index of the currently uploading file in the messageInfoList array when this callback is received.         currentIndexFileSize, // The uploaded size of the currently uploading file in bytes (B) when this callback is received.         totalIndexFileSize    // The size of the currently uploading file when this callback is received.     ) {         // You can display the upload progress here on the UI.         // Developers can use this callback to monitor the upload progress of multimedia files.         // Total file upload progress: currentFileSize / totalFileSize.         // In the above example, the total file upload progress is: 20,971,520 / 104,857,600 = 20%.         // When this callback is received, the upload progress of the currently uploading file is: currentIndexFileSize / totalIndexFileSize.     } };  const zimMultipleMessage: ZIMMessage = {     type: 10,     // The item list of multi-item message can contain a maximum of 20 items.     messageInfoList: [         // Text         {             type: 1,             message: 'xxxx',         },         // Custom message         {             type: 200,             message: 'xxxx',             subType: 100,             searchedContent: 'xxxx'         },         // Image: Only 10 allowed.         // Online image         {             type: 11,             fileDownloadUrl: 'https://xxxx.jpeg', // Original Image             thumbnailDownloadUrl: 'https://xxxx-thumbnail.jpeg', // Thumbnail             largeImageDownloadUrl: 'https://xxxx-large.jpeg', // Large Image         },         // Local Image         {             type: 11,             fileLocalPath: file, // File to be uploaded         },         // File: Only 1 allowed.          {             type: 12,             fileLocalPath: file, // File to be uploaded         },         // Audio: Only 1 allowed.          {             type: 13,             fileLocalPath: file, // File to be uploaded             audioDuration: 100, // Required: Audio duration in seconds.         },         // Video: Only 1 allowed.          {             type: 14,             fileLocalPath: file, // File to be uploaded             videoDuration: 100, // Required: Video duration in seconds.         }     ] };  zim.sendMessage(zimMultipleMessage, toConversationID, conversationType, config, notification)     .then(function ({ message }) {         // Sent successfully     })     .catch(function (err) {         // Failed to send     });

// Send a multi-item message in a one-to-one conversation 

// Pass in the userID of the message receiver 

const toConversationID = "xxxx"; 

// Advanced configuration for sending messages. 

const conversationType = 0; // 0: One-to-one; 1: Room; 2: Group 

const config: ZIMMessageSendConfig = {  

priority: 1, // Message Priority, 1: low (default), 2: medium, 3: high 

}; 

const notification: ZIMMessageSendNotification = { 

onMessageAttached: function(message) { 

//  

}, 

onMultipleMediaUploadingProgress: function( 

message, 

currentFileSize,      // Total size of uploaded files in bytes (B). For example, if 20,971,520 Byte has been uploaded, this value will be 20,971,520. 

totalFileSize,        // Total file size in bytes (B). For example, if the total file size is 104,857,600 Byte, this value will be 104,857,600. 

messageInfoIndex,     // The index of the currently uploading file in the messageInfoList array when this callback is received. 

currentIndexFileSize, // The uploaded size of the currently uploading file in bytes (B) when this callback is received. 

totalIndexFileSize    // The size of the currently uploading file when this callback is received. 

) { 

// You can display the upload progress here on the UI. 

// Developers can use this callback to monitor the upload progress of multimedia files. 

// Total file upload progress: currentFileSize / totalFileSize. 

// In the above example, the total file upload progress is: 20,971,520 / 104,857,600 = 20%. 

// When this callback is received, the upload progress of the currently uploading file is: currentIndexFileSize / totalIndexFileSize. 

} 

}; 

const zimMultipleMessage: ZIMMessage = { 

type: 10, 

// The item list of multi-item message can contain a maximum of 20 items. 

messageInfoList: [ 

// Text 

{ 

type: 1, 

message: 'xxxx', 

}, 

// Custom message 

{ 

type: 200, 

message: 'xxxx', 

subType: 100, 

searchedContent: 'xxxx' 

}, 

// Image: Only 10 allowed. 

// Online image 

{ 

type: 11, 

fileDownloadUrl: 'https://xxxx.jpeg', // Original Image 

thumbnailDownloadUrl: 'https://xxxx-thumbnail.jpeg', // Thumbnail 

largeImageDownloadUrl: 'https://xxxx-large.jpeg', // Large Image 

}, 

// Local Image 

{ 

type: 11, 

fileLocalPath: file, // File to be uploaded 

}, 

// File: Only 1 allowed.  

{ 

type: 12, 

fileLocalPath: file, // File to be uploaded 

}, 

// Audio: Only 1 allowed.  

{ 

type: 13, 

fileLocalPath: file, // File to be uploaded 

audioDuration: 100, // Required: Audio duration in seconds. 

}, 

// Video: Only 1 allowed.  

{ 

type: 14, 

fileLocalPath: file, // File to be uploaded 

videoDuration: 100, // Required: Video duration in seconds. 

} 

] 

}; 

zim.sendMessage(zimMultipleMessage, toConversationID, conversationType, config, notification) 

.then(function ({ message }) { 

// Sent successfully 

}) 

.catch(function (err) { 

// Failed to send 

});

Receive multi-item messages

The callback interface for receiving combined messages is the same as that for receiving regular messages. For details on the specific interface, please refer to Send & Receive messages - Receive messages.

The callback interface for receiving multi-item messages is the same as the callback interface for receiving regular messages. Please refer to Send & Receive messages - Receive messages for details on the specific interface.

In the message received callback, if the message type is ZIMMessageType.COMBINE, call the queryCombineMessageDetail API to query the combine message details.

In the ZIMCombineMessageDetailQueriedResult callback, iterate through the list of sub-messages. If a sub-message is of type ZIMImageMessage, download the image using the downloadMediaFile API.

The following is an example code for receiving multi-item messages in a one-to-one conversation:

// // User receives multi-item message in a one-to-one conversation zim.on('peerMessageReceived', function (zim, { messageList, info, fromConversationID }) {     console.log(messageList, fromConversationID);     messageList.forEach(function (msg) {         // This indicates that a multi-item message has been received.         if (msg.type == 10) {             msg.messageInfoList.forEach(function (info) {                 // Display UI based on the message type.                 console.log('The item type:' + info.type);             }         }     }) });

// // User receives multi-item message in a one-to-one conversation 

zim.on('peerMessageReceived', function (zim, { messageList, info, fromConversationID }) { 

console.log(messageList, fromConversationID); 

messageList.forEach(function (msg) { 

// This indicates that a multi-item message has been received. 

if (msg.type == 10) { 

msg.messageInfoList.forEach(function (info) { 

// Display UI based on the message type. 

console.log('The item type:' + info.type); 

} 

} 

}) 

});

Send/Receive @ messages

An "@" message refers to a message that contains the content of "@ + user". When a user is mentioned with an "@" message, they receive a strong notification.


Note

The "@" message is not a message type itself. A message can be both a text message or another type of message, and it can also be an "@" message.

Send @ messages

When calling sendMessage to send a message, you can use the following methods (can be used simultaneously) to mark a message as an "@" message:

mentionedUserIDs: Notifies specific users (including users outside of the conversation) to view the message. The length of the userID list passed in should be up to 50. If you need to increase this limit, please contact the ZEGOCLOUD technical support team.

isMentionAll: Notifies all other users within the conversation to view the message.

Note

Only ZIM SDK version 2.14.0 and above supports sending messages with @ information.

// Below is an example code for a user sending an @ message (text message) in a one-to-one conversation:  const toConversationID = ''; // the userID of message receiver const conversationType = 0; // Conversation type, with values: One-to-one: 0, Room: 1, Group: 2. const config: ZIMMessageSendConfig = {      priority: 1, // Set message priority, with values: Low: 1 (default), Medium: 2, High: 3. };  const notification: ZIMMessageSendNotification = {     onMessageAttached: function(message) {} }  const messageTextObj: ZIMMessage = {     type: 1,     message: 'xxxx',     isMentionAll: true, // Remind all other users in the conversation to check the message.     mentionedUserIDs: ["userId1", "userId2"], // Remind users in the list to check the message. };  zim.sendMessage(messageTextObj, toConversationID, conversationType, config, notification)     .then(function ({ message }) {         // Sent successfully     })     .catch(function (err) {         // Failed to send     });

// Below is an example code for a user sending an @ message (text message) in a one-to-one conversation:  

const toConversationID = ''; // the userID of message receiver 

const conversationType = 0; // Conversation type, with values: One-to-one: 0, Room: 1, Group: 2. 

const config: ZIMMessageSendConfig = {  

priority: 1, // Set message priority, with values: Low: 1 (default), Medium: 2, High: 3. 

}; 

const notification: ZIMMessageSendNotification = { 

onMessageAttached: function(message) {} 

} 

const messageTextObj: ZIMMessage = { 

type: 1, 

message: 'xxxx', 

isMentionAll: true, // Remind all other users in the conversation to check the message. 

mentionedUserIDs: ["userId1", "userId2"], // Remind users in the list to check the message. 

}; 

zim.sendMessage(messageTextObj, toConversationID, conversationType, config, notification) 

.then(function ({ message }) { 

// Sent successfully 

}) 

.catch(function (err) { 

// Failed to send 

});

Receive @ messages

The callback interface for receiving @ messages is the same as the callback interface for receiving regular messages. Please refer to Send & Receive messages - Receive messages for details on the specific interface.

After receiving a message, developers can implement corresponding functionalities based on their business logic, such as highlighting, etc.

Note

Only ZIM SDK versions 2.14.0 and above support receiving and viewing the content of @ messages.

If the SDK version on the receiving end is between [2.0.0, 2.14.0), the received messages and conversations will not contain @ information.

If the SDK version on the receiving end is version 1.x.x, @ messages cannot be received.

Receive mentionedInfoList

After users within a conversation are mentioned, developers can passively or actively retrieve mentionedInfoList.

mentionedInfoList contains the corresponding message ID, sender userID, and the type of ZIMMessageMentionedType.Developers can use this information to implement various business logics, such as marking conversations.

Passive retrieval

When a user is mentioned, the conversationChanged will be received, allowing you to retrieve the latest mentionedInfoListfor the current ZIMConversation.

zim.on('conversationChanged', function (zim, { info }) {     console.log(info.mentionInfoList); });

zim.on('conversationChanged', function (zim, { info }) { 

console.log(info.mentionInfoList); 

});

Active retrieval

If you use queryConversationList or queryConversation o actively fetch conversations, you can also retrieve the mentionedInfoList within the conversation. Refer to the following example code:

:::

const mentionedInfoList = conversaion.mentionedInfoList;

const mentionedInfoList = conversaion.mentionedInfoList;

Clearing mentionedInfoList of a conversation

After receiving @ messages, users need to clear the mentionedInfoList of the conversation to stop receiving notifications.

The interface for clearing the mentionedInfoList is the same as clearing the unread message count of a conversation:

clearConversationUnreadMessageCount: Clears the unread message count of a single conversation. Refer to the example code in Manage conversations - Clear single conversation message unread.

clearConversationTotalUnreadMessageCount: Clears the total unread message count of all conversations. Refer to the example code in Manage conversations - Clear all unread conversation messages.

Get the list of mentioned users

All users within the conversation can call mentionedUserIDs to obtain the specific list of mentioned users.

const userIds = message.mentionedUserIDs;

const userIds = message.mentionedUserIDs;

Confirm whether it is a reminder for all members

All users within the conversation can use the isMentionAll parameter of ZIMMessage to determine whether it is a reminder for all members.

const isMentionAll = message.isMentionAll;

const isMentionAll = message.isMentionAll;

Send/Receive broadcast messages

ZIM allows you to send messages to all online users of your app from the server side, and the targeted users will receive the messages through the client side.

Send messages to all users from the server side

Please refer to the server-side API documentation Push message to all user to learn how to send messages to all users from the server side.

Receive broadcast messages sent from the server side

Note

Only ZIM SDK versions 2.10.0 and above support receiving and viewing the content of broadcast messages sent from the server side.

If the SDK version on the receiving end is between [2.0.0, 2.10.0), broadcast messages sent from the server side cannot be received. If you need to access this message, please upgrade the SDK to version 2.10.0 or above.

Through the broadcastMessageReceived callback, you can receive push messages from all members.

Sample code:

 // User receives broadcast messages zim.on('broadcastMessageReceived', function (zim, { message }) {     console.log(message); });

// User receives broadcast messages 

zim.on('broadcastMessageReceived', function (zim, { message }) { 

console.log(message); 

});

Forward message

The ZIM SDK supports forwarding messages in one of the following ways:

Combining messages and forwarding the combined message.

Forwarding messages one by one.

For more information, see Forward messages.

Receive Tips message

ZIM SDK supports converting user operations within a conversation into Tips messages. When a related operation occurs, ZIM SDK will send a Tips message to the session to notify. For details, please refer to Receive tip messages.

Listen for the message status

On a weak network condition, this may happen: the ZIM SDK doesn't receive the response from the server for some reason (e.g., packet loss), while the message is successfully sent. In this case, the ZIM SDK considers the message sending failed due to the reply timeout, but the message is actually sent successfully, which results in message status confusion. To solve this and Clarify the message status, the SDK 2.6.0 or later now allows you to listen for the messageSentStatusChanged callback to receive the changes of the message status. And we now have three different message statuses: Sending, Success, and Failed. You can know whether your message is sent successfully by the status, and implement your event handling logic as needed.

//  Listen for the message status. zim.on('messageSentStatusChanged', function (zim, { infos }) {     infos.forEach(function (info) {         console.warn(info.message, info.status);     });   });

//  Listen for the message status. 

zim.on('messageSentStatusChanged', function (zim, { infos }) { 

infos.forEach(function (info) { 

console.warn(info.message, info.status); 

});   

});"  Delete messages

Overview

ZEGOCLOUD's In-app Chat (the ZIM SDK) provides the capability of message management, allowing you to send and receive one-to-one, group, in-room messages, query message history, delete messages, and more. With the message management feature, you can meet different requirements of various scenarios such as social entertainment, online shopping, online education, interactive live streaming, and more.

This document describes how to delete the specified messages in a specified session, or delete all the messages in a specified session.

Implementation process

The ZIM SDK supports deleting specific messages in a conversation or deleting all messages in a conversation. Deleting messages can be divided into "delete local message records" and "delete server message records". Developers can use the ZIMMessageDeleteConfig object to set advanced properties for deleting messages.

Taking the example of client A deleting certain messages or all messages with client B:


Delete the specified messages

The following process shows how Client A deletes the specified messages with Client B:

Client A and Client B log in to the ZIM SDK to send and receive messages to and from each other.

When Client A wants to delete the specified messages with Client B:

Client A logs in to the ZIM SDK first.

Client A calls the deleteMessagesmethod and pass the messageList and config parameters.

Client A receives the results through the callback ZIMMessageDeleteConfig.

SampleCode

// Delete the specified message of the conversation  const deleteMessageList: ZIMMessage[] = []; const conversationID = ''; const conversationType = 0; const config: ZIMMessageDeleteConfig = { isAlsoDeleteServerMessage: false };  zim.deleteMessages(deleteMessageList, conversationID, conversationType, config)     .then(function ({ conversationID, conversationType }) {         // Operation successful.     })     .catch(function (err) {         // Operation failed.     });

// Delete the specified message of the conversation 

const deleteMessageList: ZIMMessage[] = []; 

const conversationID = ''; 

const conversationType = 0; 

const config: ZIMMessageDeleteConfig = { isAlsoDeleteServerMessage: false }; 

zim.deleteMessages(deleteMessageList, conversationID, conversationType, config) 

.then(function ({ conversationID, conversationType }) { 

// Operation successful. 

}) 

.catch(function (err) { 

// Operation failed. 

});

Delete all messages of the specified session

The following process shows how Client A deletes all messages with Client B:

Client A and Client B log in to the ZIM SDK to send and receive messages to and from each other.

When Client A wants to delete all messages with Client B:

Client A logs in to the ZIM SDK first.

Client A calls the deleteAllMessage method and pass the conversationID, conversationType, and config parameters.

Client A receives the results through the callback ZIMMessageDeletedResult.

SampleCode

 // Delete all messages of the specified session. const conversationID = ''; const conversationType = 0; const config: ZIMMessageDeleteConfig = { isAlsoDeleteServerMessage: true };  zim.deleteAllMessage(conversationID, conversationType, config)     .then(function ({ conversationID, conversationType }) {         // Operation successful.     })     .catch(function (err) {         // Operation failed.     });

// Delete all messages of the specified session. 

const conversationID = ''; 

const conversationType = 0; 

const config: ZIMMessageDeleteConfig = { isAlsoDeleteServerMessage: true }; 

zim.deleteAllMessage(conversationID, conversationType, config) 

.then(function ({ conversationID, conversationType }) { 

// Operation successful. 

}) 

.catch(function (err) { 

// Operation failed. 

});

Delete all messages

After logging into the ZIM SDK, you can call the deleteAllConversationMessages method and pass the ZIMMessageDeleteConfig parameter to configure whether to delete messages stored on the server. This will delete all messages in one-on-one and group conversations.

After clearing all messages in all conversations:

If you want to keep the existing conversation list and update the lastMessage displayed in the conversation list to be empty, please Pull the conversation list.

If you want to clear the existing conversation list, please Delete all conversations.

// Delete all messages in all conversations  // Set whether to delete messages stored on the server const config: ZIMMessageDeleteConfig = {   isAlsoDeleteServerMessage: true }  zim.deleteAllConversationMessages(config) .then(function ({ conversationID, conversationType }) {   // Operation successful. }) .catch(function (err) { // Operation failed.

// Delete all messages in all conversations 

// Set whether to delete messages stored on the server 

const config: ZIMMessageDeleteConfig = { 

isAlsoDeleteServerMessage: true 

} 

zim.deleteAllConversationMessages(config) 

.then(function ({ conversationID, conversationType }) { 

// Operation successful. 

}) 

.catch(function (err) { 

// Operation failed." Guides

Messaging

Get message history

Get message history

Function overview

You can use ZIM APIs to query all historical messages or specified messages in one-to-one chats, group chats, or room conversations. During the query process, the ZIM SDK will first retrieve messages from the local database cache; when the local cache is incomplete, the SDK will automatically initiate a query request to the ZIM server.

This document will provide a detailed introduction on how to use ZIM SDK interfaces to implement the functionality of retrieving historical messages for one-to-one chats, group chats, and rooms.

Note

Messages cached in the local database are not subject to the server's historical message storage duration limit, but when querying the server, only messages within the historical message storage duration can be retrieved.

Except for command messages and barrage messages, historical messages of other types can be retrieved through this feature.

You can read Send and receive messages, Delete messages, and other docs based on your needs.

The number of days for historical message storage is related to the plans. For details, please refer to the "Plan Differences" section in Pricing.

Get the full message history

After logging in to ZIM SDK, users can use the queryHistoryMessage method to retrieve the message history of one-to-one chats, group chats, and rooms chats by providing the parameters conversationID and config.

Taking the example of client A retrieving the conversation history with client B in a one-on-one chat:


Client A and B log in to the ZIM SDK and send/receive one-on-one chat messages to each other.

When client A needs to retrieve the conversation records with B:

Client A first logs in to the ZIM SDK.

Client A calls the queryHistoryMessage interface and passes the conversationID and config parameters to start retrieving.

The retrieved results will be notified to client A through the ZIMMessageQueriedResult callback interface.

Sample code

// Retrieve historical messages for one-on-one chats const curMessageList: ZIMMessage[] = [];  const conversationID = ''; const conversationType = 0; // Retrieve 30 messages each time, starting from the latest message const config: ZIMMessageQueryConfig = {     nextMessage: null, // Set nextMessage to null for the first retrieval     count: 30,     reverse: true }  function queryMessageCallback({ messageList }) {     curMessageList.push(...messageList);      // When scrolling down to the topmost message on the screen, retrieve earlier messages     if (fetchMore && messageList.length > 0) {         // For subsequent pagination, set nextMessage to the first message in the current retrieved message list         config.nextMessage = messageList[0];         zim.queryHistoryMessage(conversationID, conversationType, config).then(queryMessageCallback);     } }  zim.queryHistoryMessage(conversationID, conversationType, config).then(queryMessageCallback);

// Retrieve historical messages for one-on-one chats 

const curMessageList: ZIMMessage[] = []; 

const conversationID = ''; 

const conversationType = 0; 

// Retrieve 30 messages each time, starting from the latest message 

const config: ZIMMessageQueryConfig = { 

nextMessage: null, // Set nextMessage to null for the first retrieval 

count: 30, 

reverse: true 

} 

function queryMessageCallback({ messageList }) { 

curMessageList.push(...messageList); 

// When scrolling down to the topmost message on the screen, retrieve earlier messages 

if (fetchMore && messageList.length > 0) { 

// For subsequent pagination, set nextMessage to the first message in the current retrieved message list 

config.nextMessage = messageList[0]; 

zim.queryHistoryMessage(conversationID, conversationType, config).then(queryMessageCallback); 

} 

} 

zim.queryHistoryMessage(conversationID, conversationType, config).then(queryMessageCallback);

Get specific messages

ZIM supports querying specific messages in a one-to-one or group conversation based on messageSeq (the sequence number of the message in the conversation) list (up to a maximum of 10) by calling queryMessages.

This interface is used when you only know the messageSeq of a message and do not know the complete structure of the message. For example, if a message in a conversation replies to a historical message, members of the conversation can use the repliedInfo.messageSeq of the reply to obtain the messageSeq of the historical message. At this time, you can call this interface to obtain the complete structure of the historical message.

const messageSeqs = []; // The maximum length is 10  const conversationID = ''; const conversationType = 0; // Conversation type: one-to-one: 0, group: 2   zim.queryMessages(messageSeqs, conversationID, conversationType)     .then(({ messageList }) => {         // Query successful     })     .catch((err) => {         // Query failed     });

const messageSeqs = []; // The maximum length is 10 

const conversationID = ''; 

const conversationType = 0; // Conversation type: one-to-one: 0, group: 2 

zim.queryMessages(messageSeqs, conversationID, conversationType) 

.then(({ messageList }) => { 

// Query successful 

}) 

.catch((err) => { 

// Query failed 

});"

Guides

Messaging

Delete messages

Delete messages

Overview

ZEGOCLOUD's In-app Chat (the ZIM SDK) provides the capability of message management, allowing you to send and receive one-to-one, group, in-room messages, query message history, delete messages, and more. With the message management feature, you can meet different requirements of various scenarios such as social entertainment, online shopping, online education, interactive live streaming, and more.

This document describes how to delete the specified messages in a specified session, or delete all the messages in a specified session.

Implementation process

The ZIM SDK supports deleting specific messages in a conversation or deleting all messages in a conversation. Deleting messages can be divided into "delete local message records" and "delete server message records". Developers can use the ZIMMessageDeleteConfig object to set advanced properties for deleting messages.

Taking the example of client A deleting certain messages or all messages with client B:


Delete the specified messages

The following process shows how Client A deletes the specified messages with Client B:

Client A and Client B log in to the ZIM SDK to send and receive messages to and from each other.

When Client A wants to delete the specified messages with Client B:

Client A logs in to the ZIM SDK first.

Client A calls the deleteMessagesmethod and pass the messageList and config parameters.

Client A receives the results through the callback ZIMMessageDeleteConfig.

SampleCode

// Delete the specified message of the conversation  const deleteMessageList: ZIMMessage[] = []; const conversationID = ''; const conversationType = 0; const config: ZIMMessageDeleteConfig = { isAlsoDeleteServerMessage: false };  zim.deleteMessages(deleteMessageList, conversationID, conversationType, config)     .then(function ({ conversationID, conversationType }) {         // Operation successful.     })     .catch(function (err) {         // Operation failed.     });

// Delete the specified message of the conversation 

const deleteMessageList: ZIMMessage[] = []; 

const conversationID = ''; 

const conversationType = 0; 

const config: ZIMMessageDeleteConfig = { isAlsoDeleteServerMessage: false }; 

zim.deleteMessages(deleteMessageList, conversationID, conversationType, config) 

.then(function ({ conversationID, conversationType }) { 

// Operation successful. 

}) 

.catch(function (err) { 

// Operation failed. 

});

Delete all messages of the specified session

The following process shows how Client A deletes all messages with Client B:

Client A and Client B log in to the ZIM SDK to send and receive messages to and from each other.

When Client A wants to delete all messages with Client B:

Client A logs in to the ZIM SDK first.

Client A calls the deleteAllMessage method and pass the conversationID, conversationType, and config parameters.

Client A receives the results through the callback ZIMMessageDeletedResult.

SampleCode

 // Delete all messages of the specified session. const conversationID = ''; const conversationType = 0; const config: ZIMMessageDeleteConfig = { isAlsoDeleteServerMessage: true };  zim.deleteAllMessage(conversationID, conversationType, config)     .then(function ({ conversationID, conversationType }) {         // Operation successful.     })     .catch(function (err) {         // Operation failed.     });

// Delete all messages of the specified session. 

const conversationID = ''; 

const conversationType = 0; 

const config: ZIMMessageDeleteConfig = { isAlsoDeleteServerMessage: true }; 

zim.deleteAllMessage(conversationID, conversationType, config) 

.then(function ({ conversationID, conversationType }) { 

// Operation successful. 

}) 

.catch(function (err) { 

// Operation failed. 

});

Delete all messages

After logging into the ZIM SDK, you can call the deleteAllConversationMessages method and pass the ZIMMessageDeleteConfig parameter to configure whether to delete messages stored on the server. This will delete all messages in one-on-one and group conversations.

After clearing all messages in all conversations:

If you want to keep the existing conversation list and update the lastMessage displayed in the conversation list to be empty, please Pull the conversation list.

If you want to clear the existing conversation list, please Delete all conversations.

// Delete all messages in all conversations  // Set whether to delete messages stored on the server const config: ZIMMessageDeleteConfig = {   isAlsoDeleteServerMessage: true }  zim.deleteAllConversationMessages(config) .then(function ({ conversationID, conversationType }) {   // Operation successful. }) .catch(function (err) { // Operation failed.

// Delete all messages in all conversations 

// Set whether to delete messages stored on the server 

const config: ZIMMessageDeleteConfig = { 

isAlsoDeleteServerMessage: true 

} 

zim.deleteAllConversationMessages(config) 

.then(function ({ conversationID, conversationType }) { 

// Operation successful. 

}) 

.catch(function (err) { 

// Operation failed." Guides

Messaging

Read receipts

Read receipts

Overview

Message reading receipt helps users know whether other users have read the messages they sent in a conversation. This feature applies to enterprise office businesses and other scenarios in which the message reading status needs to be known in real time.


This document describes how to use APIs of the In-app Chat SDK to send messages that require a reading receipt, query the receipt status of messages, and set messages as read.

Warning

The In-app Chat SDK supports reading receipts for one-to-one messages and group messages (only common messages and rich media messages) and does not support reading receipts for in-room messages.

Implementation process

The sender sends a message through the In-app Chat SDK and sets the hasReceipt field of ZIMMessageSendConfig to identify whether a reading receipt is required for the message. Based on the receiptStatus field, the receiver determines whether a reading receipt is required for the message or whether the message is read or unread to render different UI effects. The message receiver can use different reading methods based on the scenario.

Send a message that requires a reading receipt

When Client A wants to send a message that requires a reading receipt to Client B:

Client A and Client B log in to the In-app Chat service.

Client A calls the sendMessage or sendMediaMessage API to send a message (common message or rich media message in one-to-one or group chats) to Client B and sets the hasReceipt field of ZIMMessageSendConfig to true.

Client A calls the sendMessage or sendMediaMessage API to send a message to Client B (only supports ZIMTextMessage, ZIMImageMessage, ZIMFileMessage, ZIMAudioMessage, ZIMVideoMessage, ZIMCombineMessage, and ZIMMultipleMessage in "one-to-one" chats and "group" chats), and sets the hasReceipt field of ZIMMessageSendConfig to true;

By listening for related callback (peerMessageReceived or groupMessageReceived), Client B receives a message whose receiptStatus is set to PROCESSING.

Set the reading receipt status as read

In this operation, set a message as read and set a conversation as read are both supported.

Set a message as read

The receiver can set a message that requires a reading receipt from the sender as read. Then, the sender will receive a message read notification.

Warning

A single message or a batch of messages are supported. The sender and receiver must be in the same conversation. Cross-conversation operations are not supported.

To perform operations on the historical messages of the conversation, you need to get the historical messages and determine the receipt status of the historical messages. For details, see Get message history.

Through related callback (peerMessageReceived or groupMessageReceived), Client B receives a message that requires a reading receipt from Client A.

Based on the receiptStatus field of the callback, Client B determines the receipt status of the message. If this field is set to PROCESSING, the message is unread. Developers can call the sendMessageReceiptsRead API to set the message as read based on the service logic.

Client B determines whether the setting is successful based on ZIMMessageReceiptsReadSentResult.

Based on messageReceiptChanged of ZIMEventHandler, Client A receives a callback notification, indicating that the message is set as read. Developers can implement the service logic of setting the message as read on Client A based on this callback.

Set a conversation as read

The receiver can set all messages received from the sender in a specified conversation as read.

Warning

The In-app Chat SDK supports this feature only in one-to-one chats.

This feature takes effect only on messages received before setting the feature.

It is recommended that this feature be used when a user switches from the conversation list page to a conversation. It is not recommended that this feature be used together with the sendMessageReceiptsRead API on a message chat page.

To perform operations on the historical messages of the conversation, you need to get the historical messages and determine the receipt status of the historical messages. For details, see Get message history.

Based on the receiptStatus field of the peerMessageReceived callback, Client B determines the receipt status of the message. If this field is set to PROCESSING, the message is unread. Developers can call the sendConversationMessageReceiptRead API to set all messages sent by Client A in the conversation as read based on the service logic.

Client B determines whether the setting is successful based on ZIMConversationMessageReceiptReadSentResult .

Based on conversationMessageReceiptChanged of ZIMEventHandler , Client A receives a callback notification, indicating that all messages in the conversation are set as read. Developers can implement the logic of setting all messages sent from the sender in the conversation as read based on this callback. Developers can implement the service logic of knowing all sent messages in a conversation are set as read by Client B on Client A based on this callback.

More features

Get read receipt time

Through ZIMMessageReceiptInfo.readTime , you can get the read receipt time of the message, which can be used to implement the business scenario of secret chat, such as "burn after reading".

Supported interfaces: queryMessageReceiptsInfo、messageReceiptChanged.

Warning

For the message sender: When all members in the conversation have read the message, the read receipt time will have a value, and the server timestamp when the last member reads will be returned. Otherwise, the value is 0.

For the message receiver: The read receipt time is the server timestamp when the sendMessageReceiptsRead API is successfully called. Otherwise, the value is 0.

Get read receipt time does not support “Set a conversation as read”.

2.22.0 version onwards.

Batch query the message receipt status, number of users who have read the message, and number of users who have not read the message

To query the message receipt status, the number of users who have read the message, and the number of users who have not read the message of a message or a batch of messages, call the queryMessageReceiptsInfo API. Call ZIMMessageReceiptsInfoQueriedResult to obtain related information.

Warning

If messages sent by other users are queried, the number of users who have read the message and the number of users who have not read the message are 0.

To perform operations on the historical messages of the conversation, you need to get the historical messages and determine the receipt status of the historical messages. For details, see Get message history.

Query the list of members who have or have not read a group message

The In-app Chat SDK supports querying the list of members who have or have not read a group message.

Query the list of members who have read a group message

To query the list of members who have read a group message, call the queryGroupMessageReceiptReadMemberList API.

Warning

To perform operations on the historical messages of the conversation, you need to get the historical messages and determine the receipt status of the historical messages. For details, see Get message history.

Query the list of members who have not read a group message

To query the list of members who have not read a group message, call the queryGroupMessageReceiptUnreadMemberList API.

Warning

If the SDK version is older than 2.16.0, when the number of group members is greater than 100, this API will not return the list of members who have not read a group message. To use this feature, contact ZEGOCLOUD technical support.

To perform operations on the historical messages of the conversation, you need to get the historical messages and determine the receipt status of the historical messages. For details, see Get message history.

Sample code

// 1. Register a callback.  // The other user sets a message as read. zim.on('messageReceiptChanged', function (zim, { infos }) {     console.log('messageReceiptChanged', infos); }); // The other user sets all messages in a conversation as read. zim.on('conversationMessageReceiptChanged', function (zim, { infos }) {     console.log('conversationMessageReceiptChanged', infos); });  var userID_A = "xxxx" ;    // The ID of user A. var userID_B = "xxxx" ;    // The ID of user B.  // 2. User A sends a message that requires a reading receipt to user B. A text one-to-one message is used as an example.  const userID_A = "xxxx" ;    // ID of UserA const userID_B = "xxxx" ;    // ID of UserB  const messageObj: ZIMMessage = { type: 1, message: 'text receipt message' } const config: ZIMMessageSendConfig = {     priority: 1,    // Message priority. Valid values: 1: Low (default), 2: Medium, 3: High     hasReceipt: true    // Set that the messages require a reading receipt. } const notification: ZIMMessageSendNotification = {     onMessageAttached: function(message) {         // todo: Loading     } }  zim.sendMessage(messageObj, userID_B, 0, config, notification)     .then(function ({ message }) {         // Sent successfully.     })     .catch(function (err) {         // Sending failed.     });  // 3. User B receives the message that requires a reading receipt and sets the message as read by calling any of the following APIs.  // 3.1 Set a message as read const messages: ZIMMessage[] = [];    // Queried from queryHistoryMessage or received from peerMessageReceived zim.sendMessageReceiptsRead(messages, userID_A, 0)         .then(function ({ conversationID, conversationType, errorMessageIDs }) {         // The operation is successful. Messages that failed to be set as read are returned through errorMessageIDs.     })     .catch(function (err) {         // The operation fails.     });  // 3.2 Set a conversation as read zim.sendConversationMessageReceiptRead(userID_A, 0)     .then(function ({ conversationID, conversationType }) {         // The operation is successful. User B can set all messages sent from user A in this conversation as read.     })     .catch(function (err) {         // The operation fails.     });  // 4. (Optional) Batch query the message receipt status, number of users who have read the message, and number of users who have not read the message.  const messages: ZIMMessage[] = []; // Queried from queryHistoryMessage zim.queryMessageReceiptsInfo(messages, userID_B, 0)         .then(function ({ infos, errorMessageIDs }) {         // The operation is successful. Messages that failed to be queried are returned through errorMessageIDs.     })     .catch(function (err) {         // The operation fails.     });  // 5. (Optional) Query the list of members who have or have not read a group message.  const groupMsgObj: ZIMMessage = {}    // Queried from queryHistoryMessage const queryConfig: ZIMGroupMessageReceiptMemberQueryConfig = {     count: 10,    // The user quantity to be queried.     nextFlag: 0    // The query flag. It is set to 0 in the first query. In subsequent queries, it is set to the flag returned in Promise. }  // 5.1 The list of members who have read a group message zim.queryGroupMessageReceiptReadMemberList(groupMsgObj, groupMsgObj.conversationID, queryConfig)     .then(function ({ nextFlag, userList, groupID }) {         // The operation is successful.     })     .catch(function (err) {         // The operation fails.     });  // 5.2 The list of members who have not read a group message zim.queryGroupMessageReceiptUnreadMemberList(groupMsgObj, groupMsgObj.conversationID, queryConfig)     .then(function ({ nextFlag, userList, groupID }) {         // The operation is successful.     })     .catch(function (err) {         // The operation fails.     });

// 1. Register a callback. 

// The other user sets a message as read. 

zim.on('messageReceiptChanged', function (zim, { infos }) { 

console.log('messageReceiptChanged', infos); 

}); 

// The other user sets all messages in a conversation as read. 

zim.on('conversationMessageReceiptChanged', function (zim, { infos }) { 

console.log('conversationMessageReceiptChanged', infos); 

}); 

var userID_A = "xxxx" ;    // The ID of user A. 

var userID_B = "xxxx" ;    // The ID of user B. 

// 2. User A sends a message that requires a reading receipt to user B. A text one-to-one message is used as an example. 

const userID_A = "xxxx" ;    // ID of UserA 

const userID_B = "xxxx" ;    // ID of UserB 

const messageObj: ZIMMessage = { type: 1, message: 'text receipt message' } 

const config: ZIMMessageSendConfig = { 

priority: 1,    // Message priority. Valid values: 1: Low (default), 2: Medium, 3: High 

hasReceipt: true    // Set that the messages require a reading receipt. 

} 

const notification: ZIMMessageSendNotification = { 

onMessageAttached: function(message) { 

// todo: Loading 

} 

} 

zim.sendMessage(messageObj, userID_B, 0, config, notification) 

.then(function ({ message }) { 

// Sent successfully. 

}) 

.catch(function (err) { 

// Sending failed. 

}); 

// 3. User B receives the message that requires a reading receipt and sets the message as read by calling any of the following APIs. 

// 3.1 Set a message as read 

const messages: ZIMMessage[] = [];    // Queried from queryHistoryMessage or received from peerMessageReceived 

zim.sendMessageReceiptsRead(messages, userID_A, 0)     

.then(function ({ conversationID, conversationType, errorMessageIDs }) { 

// The operation is successful. Messages that failed to be set as read are returned through errorMessageIDs. 

}) 

.catch(function (err) { 

// The operation fails. 

}); 

// 3.2 Set a conversation as read 

zim.sendConversationMessageReceiptRead(userID_A, 0) 

.then(function ({ conversationID, conversationType }) { 

// The operation is successful. User B can set all messages sent from user A in this conversation as read. 

}) 

.catch(function (err) { 

// The operation fails. 

}); 

// 4. (Optional) Batch query the message receipt status, number of users who have read the message, and number of users who have not read the message. 

const messages: ZIMMessage[] = []; // Queried from queryHistoryMessage 

zim.queryMessageReceiptsInfo(messages, userID_B, 0)     

.then(function ({ infos, errorMessageIDs }) { 

// The operation is successful. Messages that failed to be queried are returned through errorMessageIDs. 

}) 

.catch(function (err) { 

// The operation fails. 

}); 

// 5. (Optional) Query the list of members who have or have not read a group message. 

const groupMsgObj: ZIMMessage = {}    // Queried from queryHistoryMessage 

const queryConfig: ZIMGroupMessageReceiptMemberQueryConfig = { 

count: 10,    // The user quantity to be queried. 

nextFlag: 0    // The query flag. It is set to 0 in the first query. In subsequent queries, it is set to the flag returned in Promise. 

} 

// 5.1 The list of members who have read a group message 

zim.queryGroupMessageReceiptReadMemberList(groupMsgObj, groupMsgObj.conversationID, queryConfig) 

.then(function ({ nextFlag, userList, groupID }) { 

// The operation is successful. 

}) 

.catch(function (err) { 

// The operation fails. 

}); 

// 5.2 The list of members who have not read a group message 

zim.queryGroupMessageReceiptUnreadMemberList(groupMsgObj, groupMsgObj.conversationID, queryConfig) 

.then(function ({ nextFlag, userList, groupID }) { 

// The operation is successful. 

}) 

.catch(function (err) { 

// The operation fails. 

});" Edit messages

Note

To use this feature, please subscribe to the enterprise plan.

Function introduction

The ZIM SDK supports users editing messages they have already sent in one-on-one or group chats. The updated content will be synchronized in real-time to all members of the conversation, ensuring that communication information remains consistent and up-to-date.


Setting up listener

Participants in a conversation register on listeners for messageEdited callback related to message edits. When another user edits a message, you can directly obtain relevant information about the edited message, including the edit time and editor.

Sample Code

// Register event zim.on('messageEdited', (zim, { messageList }) => {     // Upon receiving the list of edited messages, update the UI according to business needs })

Sample Code

// Register event 

zim.on('messageEdited', (zim, { messageList }) => { 

// Upon receiving the list of edited messages, update the UI according to business needs 

})

Edit a message

After successfully logging into the ZIM SDK, conversation participants can call the editMessage method to edit messages they have already sent (only supports the following types of messages: ZIMTextMessage, ZIMCustomMessage, ZIMMultipleMessage). The editable attributes are as follows:

extendedData: Message extension field.

isMentionAll: Whether to notify all participants (@everyone).

mentionedUserIDs: List of notified users (@specific user).

message: Content of ZIMTextMessage or ZIMCustomMessage.

subType: Subtype of ZIMCustomMessage.

messageInfoList: Item list of ZIMMultipleMessage.

searchedContent: Search field of ZIMCustomMessage.

The result of the editing operation will then be known through ZIMMessageEditedResult.

Note

Only supports editing messages within 24 hours. The editing is based on the message's timestamp, which will not be updated due to the message editing.

Message type cannot be changed, for Sample: ZIMTextMessage cannot be converted to ZIMCustomMessage or ZIMMultipleMessage.

Restrictions on each attribute in the edit message method are consistent with the relevant restrictions in the send message method.

Editing a message triggers the server-side pre-message sending callback and post-message sending callback.

If you have enabled ZIM content moderation, the edited message content will also be moderated, and the moderation process and limitations are the same as when sending a message.

When the message content is text (moderation before sending), failing the review will result in editing failure, and the message content will not be updated, remaining as the original content.

When the message is an image, voice, or video (sending before moderation), failing the review will result in the message being recalled, and it will not revert to the content before editing.

Sample Code

// Edit text message content const messageObj: ZIMMessage = {}; // Obtain from the queryHistoryMessage method messageObj.message = "Edited message content";  const config: ZIMMessageEditConfig = {}; const notification: ZIMMessageSendNotification = {     onMessageAttached: (message) => {},      // This callback is triggered when editing a ZIMMultipleMessage with local file uploads     onMultipleMediaUploadingProgress: (         message,         currentFileSize,         totalFileSize,         messageInfoIndex,         currentIndexFileSize,         totalIndexFileSize,     ) => {}, };  zim.editMessage(messageObj, config, notification)     .then(function ({ message }) {         // Operation successful     })     .catch(function (err) {         // Operation failed      });

Sample Code

// Edit text message content 

const messageObj: ZIMMessage = {}; // Obtain from the queryHistoryMessage method 

messageObj.message = "Edited message content"; 

const config: ZIMMessageEditConfig = {}; 

const notification: ZIMMessageSendNotification = { 

onMessageAttached: (message) => {}, 

// This callback is triggered when editing a ZIMMultipleMessage with local file uploads 

onMultipleMediaUploadingProgress: ( 

message, 

currentFileSize, 

totalFileSize, 

messageInfoIndex, 

currentIndexFileSize, 

totalIndexFileSize, 

) => {}, 

}; 

zim.editMessage(messageObj, config, notification) 

.then(function ({ message }) { 

// Operation successful 

}) 

.catch(function (err) { 

// Operation failed  

});" Guides

Messaging

Reply to a message

Reply to a message

Introduction

The ZIM SDK supports the functionality of replying to messages within a session, which means quoting a received message to provide a targeted response and forming a tree-like structure of message replies starting from that message. With this feature, users can ask questions, provide feedback, or provide additional background information in response to a specific message.

Concepts


This feature involves the following concepts:

Root message: The starting point of a reply tree, usually the initial message of a specific discussion.

Child message: A direct or indirect reply to a certain message.

Source message: The previous level message of a reply.

Reply count: The number of replies received by the root message.

Using messages A, B, and C in group chat as examples:

Message B replies to message A:

Message A is the root message.

Message A is the source message of message B.

Message B is a child message of message A.

Message C replies to message B:

Message B is the source message of message C.

Message C is a child message of message B.

Both message B and message C are child messages of message A.

The reply count of message A is 2. Message B does not have a reply count.

Reply to a message

After logging in to ZIM, users can listen to the peerMessageReceived and groupMessageReceived callback to receive new messages from one-on-one and group conversations, or call the queryHistoryMessage interface to fetch historical messages.

At this point, users can choose a message to reply to by using that message as the toOriginalMessage parameter and constructing a new message as the message parameter. Then, call the replyMessage interface.

Note

Only the following types are supported for the toOriginalMessage and message parameters:

Text message: ZIMTextMessage

Image message: ZIMImageMessage

File message: ZIMFileMessage

Audio message: ZIMAudioMessage

Video message: ZIMVideoMessage

Multi-item message: ZIMMultipleMessage

Combined message: ZIMCombineMessage

Custom message: ZIMCustomMessage

In addition to the required parameters mentioned above, you can also construct a notification object based on your business needs and listen to the following callbacks:

onMessageAttached: This callback is triggered before sending the reply, allowing you to obtain a temporary ZIMMessage object. You can use this object to add some logic, such as displaying UI in advance.

onMediaUploadingProgress: This callback provides updates on the progress of file uploads when sending messages with rich media.

The sending result will be returned through the ZIMMessageSentResult.

// The source message object, obtained through queryHistoryMessage or peerMessageReceived and receiveGroupMessage. const toOriginalMessage: ZIMMessage = {};  const config: ZIMMessageSendConfig = {      priority: 1, // Set message priority, values are low: 1 (default), medium: 2, high: 3 };  const messageTextObj: ZIMMessage = { type: 1, message: 'reply message content' }; const notification: ZIMMessageSendNotification = {     onMessageAttached: function(message) {         // todo: Loading     },     onMediaUploadingProgress: (message, currentFileSize, totalFileSize) => {         // If the reply is a media message, you can use this to display the file upload progress.     }, }  zim.replyMessage(messageTextObj, toOriginalMessage, config, notification)     .then(function ({ message }) {         // Sent successfully     })     .catch(function (err) {         // Failed to send     });

// The source message object, obtained through queryHistoryMessage or peerMessageReceived and receiveGroupMessage. 

const toOriginalMessage: ZIMMessage = {}; 

const config: ZIMMessageSendConfig = {  

priority: 1, // Set message priority, values are low: 1 (default), medium: 2, high: 3 

}; 

const messageTextObj: ZIMMessage = { type: 1, message: 'reply message content' }; 

const notification: ZIMMessageSendNotification = { 

onMessageAttached: function(message) { 

// todo: Loading 

}, 

onMediaUploadingProgress: (message, currentFileSize, totalFileSize) => { 

// If the reply is a media message, you can use this to display the file upload progress. 

}, 

} 

zim.replyMessage(messageTextObj, toOriginalMessage, config, notification) 

.then(function ({ message }) { 

// Sent successfully 

}) 

.catch(function (err) { 

// Failed to send 

});

Determine if a message is a reply to another message

When receiving new messages in one-on-one and group conversations through the peerMessageReceived and groupMessageReceived callbacks, you need to determine if the message has repliedInfo (basic information of the source message):

If it exists, it means that this message is a reply to another message.

If it doesn't exist, it means that this message is an independent message.

When you have the repliedInfo, you can use it to display the sender, sending time, and message content of the source message.

// Receive a message in a one-to-one conversation zim.on('peerMessageReceived', function (zim, { messageList, info, fromConversationID }) {     messageList.forEach((msg) => {         if (msg.repliedInfo) {             // Basic information of the source message referenced by this reply, used to display the sender, sending time, and message content of the source message.         }     }); });  // Receive a message in a group conversation zim.on('groupMessageReceived', function (zim, { messageList, info, fromConversationID }) {     messageList.forEach((msg) => {         if (msg.repliedInfo) {             // Basic information of the source message referenced by this reply, used to display the sender, sending time, and message content of the source message.         }     }); });

// Receive a message in a one-to-one conversation 

zim.on('peerMessageReceived', function (zim, { messageList, info, fromConversationID }) { 

messageList.forEach((msg) => { 

if (msg.repliedInfo) { 

// Basic information of the source message referenced by this reply, used to display the sender, sending time, and message content of the source message. 

} 

}); 

}); 

// Receive a message in a group conversation 

zim.on('groupMessageReceived', function (zim, { messageList, info, fromConversationID }) { 

messageList.forEach((msg) => { 

if (msg.repliedInfo) { 

// Basic information of the source message referenced by this reply, used to display the sender, sending time, and message content of the source message. 

} 

}); 

});

Get the number of replies to a root message

ZIM supports actively or passively obtaining the number of replies to a root message.

Active retrieval

To actively retrieve the number of replies to a root message, you can directly use ZIMMessage > rootRepliedCount to get it.

Passive retrieval

To get real-time updates on how many replies a root message has received, you can listen for the messageRepliedCountChanged event.

// Listen for changes in the number of replies to a root message // Event trigger: When a new message replied to another message successfully, the number of replies to the root message of its reply tree will increase by 1 zim.on('messageRepliedCountChanged', function (zim, { infos }) {     infos.forEach(({ count, messageID, conversationID, conversationType }) => {         // Update the rootRepliedCount of the corresponding messageID in the conversation     }); });

// Listen for changes in the number of replies to a root message 

// Event trigger: When a new message replied to another message successfully, the number of replies to the root message of its reply tree will increase by 1 

zim.on('messageRepliedCountChanged', function (zim, { infos }) { 

infos.forEach(({ count, messageID, conversationID, conversationType }) => { 

// Update the rootRepliedCount of the corresponding messageID in the conversation 

}); 

});

Listen for the deletion or recall of the source message

Listen for the messageRepliedInfoChanged callback to get the list of child messages of a message when it is deleted or recalled. You can display relevant prompts on the UI of the corresponding child messages.

Note

Even if the source message is deleted by the user on a device, causing the repliedInfo.state (the state of the source message) of its child message to be ZIMMessageRepliedInfoState.DELETED, you can still get the brief content of the source message in the repliedInfo.messageInfo of the child message. Therefore, you can choose whether to display the content of the source message on that device as needed.

// Listen for changes in the source message of a reply message // Event trigger: When the source message is "deleted" or "recalled", the repliedInfo property of the reply referencing it will change zim.on('messageRepliedInfoChanged', function (zim, { messageList }) {     messageList.forEach((msg) => {         if (msg.repliedInfo) {             if (msg.repliedInfo.state != 0) {                 // The source message referenced by this reply message has been deleted, you can display "Message deleted" at this time             } else if (msg.repliedInfo.messageInfo.type == 31) {                 // The source message referenced by this reply message has been recalled, you can display "Message recalled" at this time             }         }     }); });

// Listen for changes in the source message of a reply message 

// Event trigger: When the source message is "deleted" or "recalled", the repliedInfo property of the reply referencing it will change 

zim.on('messageRepliedInfoChanged', function (zim, { messageList }) { 

messageList.forEach((msg) => { 

if (msg.repliedInfo) { 

if (msg.repliedInfo.state != 0) { 

// The source message referenced by this reply message has been deleted, you can display "Message deleted" at this time 

} else if (msg.repliedInfo.messageInfo.type == 31) { 

// The source message referenced by this reply message has been recalled, you can display "Message recalled" at this time 

} 

} 

}); 

});

Query the reply list

Call queryMessageRepliedList and pass in the root message or any reply to view the complete list of replies and get the complete message list related to the replies.

The results returned by this interface will distinguish between the root message (rootRepliedInfo) and the reply list (messageList), and the reply list will be sorted in chronological order based on the sending time of the replies.

const replyMessage: ZIMMessage = {}; // replyMessage can be a root message or any reply, generally obtained through the queryHistoryMessage interface or peerMessageReceived and receiveGroupMessage  const config: ZIMMessageRepliedListQueryConfig = {     count: 10, // The number of queries, please do not exceed 100     nextFlag: 0, // Pagination flag, fill in 0 for the first query, and subsequent queries will be based on the nextFlag returned by the query result };  zim.queryMessageRepliedList(replyMessage, config)     .then(({ nextFlag, rootRepliedInfo, messageList }) => {         // Query successful         // If nextFlag is not 0, it means there is more data to be queried         // rootRepliedInfo is the information of the root message         // messageList represents the reply list to the root message     })     .catch((err) => {         // Query failed     });

const replyMessage: ZIMMessage = {}; // replyMessage can be a root message or any reply, generally obtained through the queryHistoryMessage interface or peerMessageReceived and receiveGroupMessage 

const config: ZIMMessageRepliedListQueryConfig = { 

count: 10, // The number of queries, please do not exceed 100 

nextFlag: 0, // Pagination flag, fill in 0 for the first query, and subsequent queries will be based on the nextFlag returned by the query result 

}; 

zim.queryMessageRepliedList(replyMessage, config) 

.then(({ nextFlag, rootRepliedInfo, messageList }) => { 

// Query successful 

// If nextFlag is not 0, it means there is more data to be queried 

// rootRepliedInfo is the information of the root message 

// messageList represents the reply list to the root message 

}) 

.catch((err) => { 

// Query failed 

});

Note

When querying the reply list, no matter the message passed is the root message or not, as long as the nextFlag is set to 0, it means querying in ascending order of message sending time starting from the root message.

Since the message in rootRepliedInfo is a nullable object, when state is ZIMMessageRepliedInfoState.Deleted, it means the root message has been deleted. At this time, developers should prompt "The root message has been deleted" on the UI. When state is ZIMMessageRepliedInfoState.NotFound, it means that the root message cannot be found anymore. The possible reasons are that the message exceeded the server storage time, or the group users query the reply list after joining the group but the root message was sent before they joined the group, so the message may not be able to be required anymore. At this time, developers should prompt "The root message cannot be located" or other informative statements on the UI.

View the context of the source message

Since the repliedInfo of a child message (i.e., a reply message) only contains basic source message data that can be used for UI display, users may need to go to the original location of the source message to read other messages near the source message.

Therefore, to implement this scenario, you need to use the repliedInfo.messageInfo property of the child message (which is the sequence number of the source message in the conversation).

Note

The repliedInfo.messageInfo property of a child message (which is the sequence number of the source message in the conversation) corresponds to the messageSeq of the source message.

Depending on whether the source message and its surrounding messages are cached in the application's memory, ZIM provides two options.

Both the source message and its surrounding messages are cached in the application's memory

When a source message and its surrounding messages are saved in your application's memory (for example, by calling queryHistoryMessage to retrieve and cache the conversation's message history), you can search the messageSeq of the source message in the memory and implement the business logic to go to the original location of the source message to view the context.

The source message or its surrounding messages are not cached in the application's memory

When the source message or its surrounding messages are not cached in the application's memory, if another user replies to the source message in the conversation, you can:

From the repliedInfo.messageInfo of the reply, get the messageSeq of the source message. Pass it as a parameter to call the queryMessages interface to get the complete ZIMMessage object of the source message.

const messageSeqs = []; // messageSeq is the sequence number of the source message in the conversation  const conversationID = ''; const conversationType = 0; // Conversation Type: ono-to-onr: 0; group: 2  zim.queryMessages(messageSeqs, conversationID, conversationType)     .then(({ messageList }) => {         // Query successful     })     .catch((err) => {         // Query failed     });

const messageSeqs = []; // messageSeq is the sequence number of the source message in the conversation 

const conversationID = ''; 

const conversationType = 0; // Conversation Type: ono-to-onr: 0; group: 2 

zim.queryMessages(messageSeqs, conversationID, conversationType) 

.then(({ messageList }) => { 

// Query successful 

}) 

.catch((err) => { 

// Query failed 

});

Pass the source message object as the nextMessage parameter to queryHistoryMessage, so that you can use the source message as an anchor point to retrieve messages from the messages forward or backward.

// This example demonstrates querying forward from the source message const originalMessage: ZIMMessage = {}; const config: ZIMMessageQueryConfig = {     // originalMessage is the source message obtained through queryMessages     nextMessage: originalMessage,     count: 20,     reverse: false, };  const conversationID = ''; const conversationType = 0;   zim.queryHistoryMessage(conversationID, conversationType, config)     .then((res) => {         // Query successful     })     .catch((err) => {         // Query failed     });

// This example demonstrates querying forward from the source message 

const originalMessage: ZIMMessage = {}; 

const config: ZIMMessageQueryConfig = { 

// originalMessage is the source message obtained through queryMessages 

nextMessage: originalMessage, 

count: 20, 

reverse: false, 

}; 

const conversationID = ''; 

const conversationType = 0;  

zim.queryHistoryMessage(conversationID, conversationType, config) 

.then((res) => { 

// Query successful 

}) 

.catch((err) => { 

// Query failed 

});" Guides

Messaging

Respond to messages with emoticons

Respond to messages with emoticons

Overview

An emoticon response to a message indicates how a user responds to a message. The emoticon response feature is usually used to respond to a message in a private chat or group chat by adding an emoticon response to or removing an emoticon response from the message. Further, the emoticon response feature can be used in scenarios such as group voting and group voting result confirmation.


Note

The preceding figure shows merely a UI example of an emoticon response. ZEGO Instant Messaging (ZIM) SDK does not provide aesthetics resources for emoticon responses. You must add aesthetics resources as needed.

Procedure

ZIM SDK allows you to respond to a specific message in a private chat or group chat. The procedure is described in the following figure, in which a client B responds to a message from a client A by adding an emoticon response to or removing an emoticon response from the message.


The client A and the client B each create a ZIM instance and register the messageReactionsChanged callback of the ZIMEventHandler class to listen to emoticon response changes.

The client A and the client B log in to ZIM SDK.

The client A sends a private-chat message to the client B, and the client B adds an emoticon response to the message.

The client B calls the addMessageReaction operation and set the reactionType and message parameters to specify the message to which an emoticon response is added.

The client B obtains the addition result by invoking the ZIMMessageReactionAddedResult callback.

The client A receives a notification about an emoticon response change by invoking the messageReactionsChanged callback.

The client B removes the preceding emoticon response.

The client B calls the deleteMessageReaction operation and set the reactionType and message parameters to specify the message whose emoticon response is to be removed.

The client B obtains the removal result by invoking the ZIMMessageReactionDeletedResult callback.

The client A receives a notification about an emoticon response change by invoking the messageReactionsChanged callback.

1. Listen to an emoticon response change

After a user creates a ZIM instance, the user must register the messageReactionsChanged callback of the ZIMEventHandler class to listen to emoticon response changes. This way, when other users add emoticon responses to or remove emoticon responses from a specific message, the user that registers the onMessageReactionsChanged callback can obtain relevant emoticon response information, such as the types of the emoticon responses and the number of users who add emoticon responses or remove emoticon responses. In general, this callback can return information about a maximum of five users. For more user information details, see the "Query details of emoticon responses" section of the Respond to messages with emoticons topic.

//  Received message with emoticons callback. zim.on('messageReactionsChanged', function (zim, { reactions }) {     console.log(reactions); });

//  Received message with emoticons callback. 

zim.on('messageReactionsChanged', function (zim, { reactions }) { 

console.log(reactions); 

});

2. Add an emoticon response

You can call the addMessageReaction operation to add an emoticon response to any message sent in a private chat or a group chat. You can obtain the addition result by invoking the ZIMMessageReactionAddedResult callback. In general, this Result can return information about a maximum of five users. For more user information details, see the "Query details of emoticon responses" section of the Respond to messages with emoticons topic.

Note

If you repeatedly call this operation to add emoticon responses to the same message, an error may occur.

By default, a maximum of 100 types of emoticon responses can be given to a message. To expand the upper limit, contact ZEGO technical support.

typescript

const reactionType = "key"; const messageObj: ZIMMessage = {};  zim.addMessageReaction(reactionType, messageObj)     .then(function (reaction) {         // The operation is successful, and you should update the status list of the message on the UI.     })     .catch(function (err) {         // The operation fails.     });

const reactionType = "key"; 

const messageObj: ZIMMessage = {}; 

zim.addMessageReaction(reactionType, messageObj) 

.then(function (reaction) { 

// The operation is successful, and you should update the status list of the message on the UI. 

}) 

.catch(function (err) { 

// The operation fails. 

});

3. Remove an emoticon response

After you add an emoticon response to a message, you can call the deleteMessageReaction operation to remove the emoticon response. You can obtain the removal result by invoking the ZIMMessageReactionDeletedResult callback. In general, this Callback can return information about a maximum of five users. For more user information details, see the "Query details of emoticon responses" section of the Respond to messages with emoticons topic.

Note

You can call this operation to remove an emoticon response that you added.

Sample code

const reactionType = "key"; const messageObj: ZIMMessage = {};  zim.deleteMessageReaction(reactionType, messageObj)     .then(function (reaction) {         //The operation is successful, and the status list of the message is updated on the UI.     })     .catch(function (err) {         //The operation fails.     });

const reactionType = "key"; 

const messageObj: ZIMMessage = {}; 

zim.deleteMessageReaction(reactionType, messageObj) 

.then(function (reaction) { 

//The operation is successful, and the status list of the message is updated on the UI. 

}) 

.catch(function (err) { 

//The operation fails. 

});

What's more

Query details of emoticon responses

You can query only brief information about the users that listen to, add, and remove emoticon responses. By default, you can query information about a maximum of five users. To expand the upper limit, contact ZEGO technical support. To query specific users who give a specific type of emoticon responses to a specific message, call the queryMessageReactionUserList operation. You can obtain the operation result by invoking the ZIMMessageReactionUserListQueriedResult callback.

Sample code

const config: ZIMMessageReactionUserQueryConfig = {     nextFlag: 0,     reactionType: "key",     count: 20, }; const messageObj: ZIMMessage = {};  zim.queryMessageReactionUserList(messageObj, config)     .then(function (res) {         // The operation is successful, and the status list of the message is updated on the UI.     })     .catch(function (err) {         // The operation fails.      });

const config: ZIMMessageReactionUserQueryConfig = { 

nextFlag: 0, 

reactionType: "key", 

count: 20, 

}; 

const messageObj: ZIMMessage = {}; 

zim.queryMessageReactionUserList(messageObj, config) 

.then(function (res) { 

// The operation is successful, and the status list of the message is updated on the UI. 

}) 

.catch(function (err) { 

// The operation fails. 

});