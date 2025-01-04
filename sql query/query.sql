create table comments(
	comment_id serial primary key,
	title varchar(100) not null,
	msg varchar(800) not null,
	likes int,
	user_name varchar(50),
	comment_date date
)

