"""Genera datos locales de demostración; no accede a Firebase.
Uso: python generar-demo.py (requiere Faker==37.12.0).
"""
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from faker import Faker

fake = Faker('es_AR')
fake.seed_instance(13112026)
rng = fake.random
out = Path(__file__).resolve().parents[1]
zone = timezone(timedelta(hours=-3))
start = datetime(2026, 5, 1, tzinfo=zone)
end = datetime(2026, 11, 1, tzinfo=zone)
rooms = [{'id': f'h{i:02}', 'nombre': f'Hab. {i:02}', 'categoria': 'Estándar' if i <= 8 else 'Superior',
          'tarifa': 16000 + (i % 4) * 1500 + (7000 if i > 8 else 0)} for i in range(1, 13)]
staff = [fake.first_name() for _ in range(4)]
stays = []
for room in rooms:
    cursor = start
    while cursor < end:
        hour = cursor.hour
        chance = .09 if 4 <= hour < 12 else .22 if hour < 18 else .38
        chance *= 1.45 if cursor.weekday() in (4, 5) else .85 if cursor.weekday() in (0, 1) else 1
        chance *= .75 + int(room['id'][1:]) / 30
        if rng.random() > chance:
            cursor += timedelta(hours=1)
            continue
        arrival = cursor + timedelta(minutes=rng.randint(0, 45))
        departure = arrival + timedelta(minutes=rng.choice([90, 120, 150, 180, 240, 360]))
        if departure > end:
            break
        promo = 'Mañana' if 6 <= hour < 12 else 'Sin promoción'
        amount = round(room['tarifa'] * ((departure-arrival).total_seconds()/3600/2) *
                       (.8 if promo == 'Mañana' else 1) / 100) * 100
        stays.append({'id': fake.uuid4(), 'habitacion': room['id'], 'ingreso': arrival.isoformat(),
                      'egreso': departure.isoformat(), 'importe': amount, 'promocion': promo,
                      'operador': rng.choice(staff), 'medio': rng.choice(['Efectivo','Débito','Crédito','Transferencia'])})
        cursor = departure + timedelta(minutes=30)
stays.sort(key=lambda s: s['ingreso'])
data = {'simulado': True, 'semilla': 13112026, 'zonaHoraria': 'America/Argentina/Mendoza',
        'desde': start.isoformat(), 'hasta': end.isoformat(), 'habitaciones': rooms, 'estadias': stays}
(out/'datos-demo.json').write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
# Inserta los datos en la pantalla para que funcione incluso al abrirla como archivo.
page = out/'rendimiento-albergo.html'
text = page.read_text()
a, b = '<!-- demo-data-start -->', '<!-- demo-data-end -->'
screen_data = {**data, 'estadias': [{k: s[k] for k in ['habitacion', 'ingreso', 'egreso', 'importe']} for s in stays]}
block = a+'\n<script type="application/json" id="datos-albergo">'+json.dumps(screen_data, ensure_ascii=False, separators=(',', ':'))+'</script>\n'+b
if a in text:
    text = text[:text.index(a)] + block + text[text.index(b)+len(b):]
else:
    text = text.replace('<script>\n(function(){', block+'\n<script>\n(function(){', 1)
page.write_text(text)
print(f'{len(rooms)} habitaciones · {len(stays)} estadías · mayo a octubre 2026')
