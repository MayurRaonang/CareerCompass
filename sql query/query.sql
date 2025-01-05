create table comments(
	comment_id serial primary key,
	title varchar(100) not null,
	msg varchar(800) not null,
	likes int,
	user_name varchar(50),
	comment_date date
)

create table userinfo(
	uid serial primary key,
	email varchar(100),
	password varchar(100),
	assesment int,
	age int,
	phone_no int,
	name varchar(100),
	address varchar(800),
	education varchar(500)
);