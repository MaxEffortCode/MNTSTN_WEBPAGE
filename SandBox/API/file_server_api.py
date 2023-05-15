import socket
import sys
import os

### Client Side ###

HOST = '127.0.0.1'  # The server's hostname or IP address
PORT = 65433      # The port used by the server

def recvall(sock, size):
    data = b''
    while len(data) < size:
        packet = sock.recv(size - len(data))
        if not packet:
            return None
        data += packet
    return data

if __name__ == '__main__':
    cik = sys.argv[1]
    year = sys.argv[2]
    quarter = sys.argv[3]

    request = f"CIK,{cik},{year},{quarter}"
    
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((HOST, PORT))
        s.sendall(request.encode())
        response = b''
        while True:
            data = s.recv(1024)
            print(f"Received {len(data)} bytes")
            response += data
            if len(data) < 1024:
                break
            

    print('Received:', response.decode())