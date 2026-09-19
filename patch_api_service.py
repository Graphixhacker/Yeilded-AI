import re

api_path = "src/services/api.ts"
with open(api_path, "r") as f:
    api = f.read()

profile_method = """  async updateProfile(name: string): Promise<{ user: User }> {
    const data = await request('/user/profile', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    if (data.user) {
      try {
        localStorage.setItem('mun_user', JSON.stringify(data.user));
      } catch {}
    }
    return data;
  },
  async getMe(): Promise<{ user: User }> {"""

api = api.replace("  async getMe(): Promise<{ user: User }> {", profile_method)

with open(api_path, "w") as f:
    f.write(api)

