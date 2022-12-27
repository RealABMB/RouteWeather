import mysql.connector

mydb = mysql.connector.connect(
    host='routeweather.cezjcubxqftc.us-east-1.rds.amazonaws.com',
    user="root",
    passwd="Gopesh123"
)

my_cursor = mydb.cursor()

my_cursor.execute("CREATE DATABASE routeweather")

my_cursor.execute("SHOW DATABASES")

for db in my_cursor:
    print(db)