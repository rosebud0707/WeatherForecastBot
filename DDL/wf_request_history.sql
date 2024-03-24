CREATE TABLE wf_request_history (
      seq_id INT NOT NULL AUTO_INCREMENT
    , id VARCHAR(500) NOT NULL
    , request_time  TIMESTAMP
    , create_time TIMESTAMP
    , PRIMARY KEY (seq_id)
);