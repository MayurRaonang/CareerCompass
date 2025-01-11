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

CREATE TABLE rough (
    career_id SERIAL PRIMARY KEY,
    career_name VARCHAR(100) NOT NULL,
    career_description TEXT NOT NULL,
    salary NUMERIC(10, 2),
    growth VARCHAR(50),
    requirement1 VARCHAR(255),
    requirement2 VARCHAR(255),
    requirement3 VARCHAR(255) 
);