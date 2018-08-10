-- 
-- create publisher_video metadata overrides/enhancement table
-- 
create table video_nodes (
  isrc varchar(12) not  null,
  created timestamp default CURRENT_TIMESTAMP,
  data text not null,
CONSTRAINT pkisrc PRIMARY KEY(isrc)
);

create table video_edges (
  isrc varchar(12) not  null,
  subscriber varchar(40) not null,
  state varchar(20) not null,
  created timestamp default CURRENT_TIMESTAMP,
  modified datetime  NULL ON UPDATE CURRENT_TIMESTAMP,
  labels text,
CONSTRAINT pkedge PRIMARY KEY(isrc, subscriber, state)
);

create table cms_video (
  isrc varchar(12) not  null,
  subscriber varchar(40) not null,
  created timestamp default CURRENT_TIMESTAMP,
  modified datetime  NULL ON UPDATE CURRENT_TIMESTAMP,
  data text not null,
CONSTRAINT pkisrcsubcrbr PRIMARY KEY(isrc, subscriber)
);

