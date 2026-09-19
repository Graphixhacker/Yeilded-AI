import json

with open('data/mun_database.json', 'r') as f:
    db = json.load(f)

for uid, user in db['users'].items():
    if user['email'] == 'abdulahad2010mine@gmail.com':
        db['passwords'][uid] = 'password123'

with open('data/mun_database.json', 'w') as f:
    json.dump(db, f, indent=2)

