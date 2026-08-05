---
markdown:
  toc:
    depth: 3
---

# Managing Catena Backup in AWS

## Periodic Backups of EC2 host

The Catena EC2 instance uses the EBS volume created during terraform deploy for it's persistent storage.
Periodic snapshots (daily/weekly/monthly/etc) of the Catena deployment's EC2 host can be made using the [AWS EBS 
snapshot procedures outlined in AWS documentation](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-snapshots.html)

## Manual Backup/Restore of Catena Databases

The individual Catena Sqlite3 and Redis databases can be manually backed up and restored as needed with the following procedures:

### Catena Sqlite3 Backup

#### 1. Login to EC2 instance console  
	Navigate to the EC2 instance in [AWS console](troubleshooting-common-issues#finding-things-in-the-aws-console)  
	Click the 'Connect' button  
		This will give you a shell on the EC2 instance (Catena host) as the 'ubuntu' user  

#### 2. Make backups of Sqlite3 database files using the SqLite3 Online Backup API from the command line  
	The database directories are mounted into the Catena container from the EC2 host under:  
		Sqlite3:  
			`/var/lib/dokku/data/storage/platform/Database/SqliteDatabase`  
  
	Issue the command:  
		```bash
		sudo sqlite3 source.db ".backup target.db"  
		```
		This creates a backup of source.db to target.db safely 

#### 3. Copy backup files to the 'catena-backup' S3 bucket  
	Issue the command:  
		```bash
		aws s3 cp /path/to/your/file s3://catena-backup/  
		```
	Example (connected to Catena EC2 instance through AWS console):
		```bash  
		cd /var/lib/dokku/data/storage/platform/Database/SqliteDatabase  
		sudo sqlite3 accounts.db ".backup /home/ubuntu/backup_accounts.db"  
		aws s3 cp /home/ubuntu/backup_accounts.db s3://catena-backup  
		rm /home/ubuntu/backup_accounts.db  
		```
Note:  
	Catena sessions have a relatively short lifetime (approx 30 minutes) so backing up session.db for loss prevention may not be effective

### Catena Sqlite3 Backup Restore

#### 1. Login to EC2 instance console  
	Navigate to the EC2 instance in [AWS console](troubleshooting-common-issues#finding-things-in-the-aws-console)  
	Click the 'Connect' button  
		This will give you a shell on the EC2 instance (Catena host) as the 'ubuntu' user  

#### 2. Copy backup from the 'catena-backup' S3 bucket to the Catena database directory  
	The database directories are mounted into the Catena container from the EC2 host under:  
		Sqlite3:  
			`/var/lib/dokku/data/storage/platform/Database/SqliteDatabase`  
  
	Issue the command:  
		```bash
		aws s3 cp s3://source-bucket/path/to/file .  
		```

#### 3. Restore the database backup copy to the live database  
	Issue the command:  
		```bash
		sudo sqlite3 target_database.db ".restore backupfile.db"  
		```
	Example (connected to Catena EC2 instance through AWS console):  
		```bash
		aws s3 cp s3://catena-backup/backup_accounts.db /home/ubuntu/backup_accounts.db  
		cd /var/lib/dokku/data/storage/platform/Database/SqliteDatabase  
		sudo sqlite3 ./accounts.db ".restore /home/ubuntu/backup_accounts.db  
		rm /home/ubuntu/backup_accounts.db  
		```

### Catena Redis Backup

#### 1. Login to EC2 instance console  
	Navigate to the EC2 instance in [AWS console](troubleshooting-common-issues#finding-things-in-the-aws-console)  
	Click the 'Connect' button  
		This will give you a shell on the EC2 instance (Catena host) as the 'ubuntu' user  

#### 2. Make backups of the Redis database using dokku commands from the command line  
	Issue the command:  
		```bash
		sudo dokku redis:list  
		sudo dokku redis:export <service> > data.dump  
		```
		This creates a backup of the redis database to data.dump

#### 3. Copy backup files to the 'catena-backup' S3 bucket  
	Issue the command:  
		```bash
		aws s3 cp /path/to/your/file s3://catena-backup/  
		```

	Example (connected to Catena EC2 instance through AWS console):  
		```bash
		sudo dokku redis:list  
		sudo dokku redis:export catena-redis > data.dump  
		aws s3 cp /home/ubuntu/backup_accounts.db s3://catena-backup  
		rm data.dump  
		```

Note:  
	Catena sessions have a relatively short lifetime (approx 30 minutes) so backing up session information contained in redis for loss prevention may not be effective

### Catena Redis Backup Restore

#### 1. Login to EC2 instance console  
	Navigate to the EC2 instance in [AWS console](troubleshooting-common-issues#finding-things-in-the-aws-console)  
	Click the 'Connect' button  
		This will give you a shell on the EC2 instance (Catena host) as the 'ubuntu' user  

#### 2. Copy backup from the 'catena-backup' S3 bucket to the Catena database directory  
	Issue the command:  
		```bash
		aws s3 cp s3://source-bucket/path/to/file .`  
		```

#### 3. Restore the database backup copy to the live database  
	Issue the command:  
		```bash
		sudo dokku redis:list  
		sudo dokku redis:import <service> < backup_file.dump  
		```

	Example (connected to Catena EC2 instance through AWS console):  
		```bash
		aws s3 cp s3://catena-backup/data.dump /home/ubuntu/data.dump  
		sudo dokku redis:list  
		sudo dokku redis:import catena-redis < data.dump  
		```
