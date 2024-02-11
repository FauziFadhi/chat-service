use chat_service;

create table users (
	id uuid,
	"name" varchar,
	"username" varchar,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	PRIMARY KEY (username)
);

create index users_id on users(id);

create table private_rooms (
	id uuid,
	"name" varchar,
	participant_ids FROZEN<LIST<TEXT>>,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	PRIMARY KEY (participant_ids)
);

create index private_rooms_id on private_rooms(id);

create table messages (
	id BIGINT,
	author_id uuid,
	room_id uuid,
	"type" varchar,
	content text,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	PRIMARY KEY (room_id, id)
) WITH CLUSTERING ORDER BY (id DESC);