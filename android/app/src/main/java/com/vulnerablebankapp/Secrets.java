package com.vulnerablebankapp;

public class Secrets {

    // Hardcoded admin JWT token (valid for testing)
    public static final String HARDCODED_ADMIN_JWT =
        "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiaXNfYWRtaW4iOnRydWUsImlhdCI6MTc0NDk3NjIyM30.yXm-7iN-6sn3kvvXkOiOLVRHXSn6MBSpwbM2VcXVds8";

    // Also contains a debug API endpoint
    public static final String DEBUG_ENDPOINT = "http://192.168.18.5:5000/debug/users";

    // Bonus: an old API key no longer in use
    public static final String OLD_API_KEY = "sk_test_51LbrQwFakeKeyToTest1234567890";
}
