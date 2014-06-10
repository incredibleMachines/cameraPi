#!/usr/bin/expect

cd ~/piFirmware

spawn git pull local master

expect "Password:" {
	send "git\r"
}

interact
