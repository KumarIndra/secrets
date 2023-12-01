-- userform Table Creation
CREATE TABLE userform (
	id serial primary key,
	username varchar(100),
	password varchar(100),
	date Date DEFAULT CURRENT_DATE,
	time Time DEFAULT CURRENT_TIME
);

select * from userform;