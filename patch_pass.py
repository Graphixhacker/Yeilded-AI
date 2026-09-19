import json

db_path = "data/mun_database.json"

with open(db_path, "r") as f:
    db = json.load(f)

# Find the user ID for abdulahad2010mine@gmail.com
target_user_id = None
for user_id, user_data in db.get("users", {}).items():
    if user_data.get("email") == "abdulahad2010mine@gmail.com":
        target_user_id = user_id
        break

if target_user_id:
    # Update the password
    db["passwords"][target_user_id] = "broskiyeildedabdulahad2010"
    
    with open(db_path, "w") as f:
        json.dump(db, f, indent=2)
    print(f"Password updated successfully for {target_user_id}")
else:
    print("Error: Could not find user in database")
