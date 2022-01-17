import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(host='chess-be.ctwicvo7fb5e.ap-south-1.rds.amazonaws.com',
                                         database='Chess',
                                         user='admin',
                                         password='ChessBE123')
    if connection.is_connected():
        db_Info = connection.get_server_info()
        print("Connected to MySQL Server version ", db_Info)
        cursor = connection.cursor()
        cursor.execute('SELECT LastSpinTime from PlayerStats WHERE UserId = "sirsha2k1641792581139"')
        record = cursor.fetchone()
        print("Data: \n", record[0],type(record[0]))

except Error as e:
    print("Error while connecting to MySQL", e)
finally:
    if connection.is_connected():
        cursor.close()
        connection.close()
        print("MySQL connection is closed")