# Technical Stack
- Nodejs 20.10
- Nestjs 10
- Cassandra 4.1
- Redis 6
- Kafka

--- 

# How To Run
make sure you can run `docker-compose`. here is the [installation guide](https://docs.docker.com/compose/install/).

1. make sure you are in the root folder of this project.
2. rename `.env.example` file to `.env`
3. then we can run our project with `docker-compose` with this command
```sh
docker-compose --project-name=wgw up -d
``` 

4. next we have to prepare our database but `wait` about `1 minutes` to makesure cassandra completely running, we need to create keyspace and the tables. 
for this project i dont create a database migration schema, because of that i created this script.
```sh
bash create_keyspace.sh
``` 
5. finish!! you already run the project.

---
---
# Project Documentation
- [Postman Link](https://documenter.getpostman.com/view/4219273/2sA2r3YkbU) postman just can publish the HTTP collection but can't publish the socket docs

##  Collection Description
### HTTP Docs
- Account : List of api documentation of `account` module
- - `Register`: to create an `account` to our apps
- - `Login` : to get token to access our apps (just a `basic token` with `username` and static password)
- - `me`*: to get our data
- - `List`: to get list of users account
- Chat : List of api documentations of chat module
- - get Room Id*: this api will give a `roomId` with peer that we want to chat, if we dont have yet it will create it for us.
- - Latest Messages*: list of messages for a room, with a pagination filter based on Id

### Socket IO Docs (`URL: localhost:3000/chats`)
event `message`* : this event for client send a message to peer on the room.
```json
{
    "type": "private",
    "roomId": "{{roomId}}",
    "content": {
        "type": "text",
        "message": "{{your message}}"
    }
}
```
event `join`*: this event for client to join a room
```json
{
    "roomId": "{{roomId}}"
}
```
event `leave`*: this event for client to leave a room
```json
{
    "roomId": "{{roomId}}"
}
```
nb:
- `*` is need the basic token from login, put the token at `Authorization` header. ex: `Authorization: this_is_your_token`
- client socket need to listen
- - event `reply`*: to receive a message via message receiver is in the room
- - event `notification`*: to listen an notification event like the message has been `sent`, new inbox if we are outside the `inbox`
- - event `error`*: to receive an error if there is something about our messages