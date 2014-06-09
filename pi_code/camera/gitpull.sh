#!/usr/bin/expect

spawn git pull local master

expect "Password:" {
	send "git\r"
}

interact
