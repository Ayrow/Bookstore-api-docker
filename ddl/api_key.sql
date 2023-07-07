drop table if exists api_key

create table api_key (
  api_key varchar(36),
  valid_to_date timestamp not null,
  added_dttm timestamp default now()
)