Create table comments(
	c_id serial primary key,
	title varchar(200),
	msg varchar(500),
	user_name varchar(100),
	comment_date varchar(50),
	topic1 varchar(100),
	topic2 varchar(100),
	topic3 varchar(100)
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

CREATE TABLE career (
    career_id SERIAL PRIMARY KEY,
    career_name VARCHAR(100) NOT NULL,
    career_description TEXT NOT NULL,
    salary NUMERIC(10, 2),
    growth VARCHAR(50),
    requirement1 VARCHAR(255),
    requirement2 VARCHAR(255),
    requirement3 VARCHAR(255) 
);