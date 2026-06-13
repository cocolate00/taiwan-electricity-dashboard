def test_get_power_generation(client):
    # 測試基本發電量趨勢 API
    response = client.get("/api/charts/generation")
    assert response.status_code == 200
    json_data = response.json()
    assert "data" in json_data
    assert isinstance(json_data["data"], list)

def test_get_power_generation_with_filters(client):
    # 測試帶有年份篩選的發電量 API
    response = client.get("/api/charts/generation?start_year=2020&end_year=2024")
    assert response.status_code == 200
    json_data = response.json()
    assert "data" in json_data
    for item in json_data["data"]:
        assert 2020 <= item["year"] <= 2024

def test_get_industry_consumption(client):
    # 測試產業用電統計 API (2024年)
    response = client.get("/api/charts/industry-consumption?year=2024")
    assert response.status_code == 200
    json_data = response.json()
    assert "year" in json_data
    assert json_data["year"] == 2024
    assert "data" in json_data
    assert isinstance(json_data["data"], list)

def test_get_industry_consumption_dynamic_2026(client):
    # 測試 2026 年動態累計產業用電統計 API
    response = client.get("/api/charts/industry-consumption?year=2026&month=0")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["year"] == 2026
    assert "data" in json_data
    assert isinstance(json_data["data"], list)

def test_get_power_consumption_history(client):
    # 測試歷史用電統計 API
    response = client.get("/api/charts/consumption-history")
    assert response.status_code == 200
    json_data = response.json()
    assert "data" in json_data
    assert isinstance(json_data["data"], list)
