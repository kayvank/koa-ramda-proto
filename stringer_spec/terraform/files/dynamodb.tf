resource "aws_dynamodb_table" "videos-table" {
  name           = "cs-pub-videos"
  read_capacity  = "${var.dynamo_videos_read}"
  write_capacity = "${var.dynamo_videos_write}"
  hash_key       = "isrc"

  attribute {
    name = "isrc"
    type = "S"
  }
  tags {
    team        = "${var.team}"
    service     = "${var.service}"
    environment = "${var.environment}"
    env         = "${var.env_shortname}"
  }
  ttl {
    attribute_name = "TimeToExist"
    enabled        = false
  }
}

resource "aws_dynamodb_table" "workflow_table" {
  name           = "cs-pub-workflow"
  read_capacity  = "${var.dynamo_workflow_read}"
  write_capacity = "${var.dynamo_workflow_write}"
  hash_key       = "isrc"
  range_key      = "subscriber"

  attribute {
    name = "isrc"
    type = "S"
  }
  attribute {
    name = "subscriber"
    type = "S"
  }

  attribute {
    name = "modified"
    type = "N"
  }

  global_secondary_index {
    name =  "SubscriberPubStateNdx2"
    hash_key = "isrc"
    range_key = "modified"
    non_key_attributes = ["subscriber", "state"]
    projection_type = "INCLUDE"
    read_capacity  = "${var.dynamo_workflow_read}"
    write_capacity = "${var.dynamo_workflow_write}"
  }
  tags {
    team        = "${var.team}"
    service     = "${var.service}"
    environment = "${var.environment}"
    env         = "${var.env_shortname}"
  }
  ttl {
    attribute_name = "TimeToExist"
    enabled        = false
  }
}
