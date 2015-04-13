#!/bin/sh

ssh yjz@ssh.cs.brown.edu "cd /web/cs/web/people/yjz/3d_genome_browser; git fetch --all;git reset --hard origin/master;chmod -R 755 ./*;"
