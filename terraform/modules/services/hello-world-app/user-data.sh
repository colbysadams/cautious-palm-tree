#!/bin/bash

sudo yum update -y
sudo yum -y install docker
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo chkconfig docker on

sudo docker run -d --rm -p ${server_port}:${docker_port} ${docker_container}
