import pandas as pd

df = pd.read_excel('docs/Plan_de_Test_Empreinte_Fiscale.xlsx')

in_t6 = False
t6_tests = []

for idx, row in df.iterrows():
    test_id = str(row.iloc[0]) if pd.notna(row.iloc[0]) else ""
    
    if 'T6' in test_id and test_id.strip().startswith('T6'):
        in_t6 = True
    elif in_t6 and test_id.strip().startswith('T') and 'T6' not in test_id:
        break
    
    if in_t6 and test_id.strip():
        description = str(row.iloc[1]) if pd.notna(row.iloc[1]) else ""
        status = str(row.iloc[3]) if len(row) > 3 and pd.notna(row.iloc[3]) else ""
        comment = str(row.iloc[4]) if len(row) > 4 and pd.notna(row.iloc[4]) else ""
        
        t6_tests.append({
            'id': test_id,
            'description': description,
            'status': status,
            'comment': comment
        })

print("=" * 70)
print("SECTION T6 - Journal fiscal quotidien")
print("=" * 70)
for test in t6_tests:
    status_emoji = "✅" if "OK" in test['status'] else "❌" if "KO" in test['status'] else "⚠️"
    print(f"\n{status_emoji} {test['id']} - {test['description']}")
    if test['comment']:
        print(f"   💬 {test['comment']}")
print("\n" + "=" * 70)
