import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: 'postgresql://postgres.tpazhvlkndjywuofhmmm:si7Q6lgxwBMANli7@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true'
});

async function main() {
  await client.connect();
  const res1 = await client.query('SELECT * FROM daily_challenges');
  console.log('CHALLENGES:');
  console.table(res1.rows);

  const res2 = await client.query('SELECT * FROM badges');
  console.log('BADGES:');
  console.table(res2.rows);

  const res3 = await client.query(`
    SELECT cotd.id as cotd_id, cotd.tanggal, dc.nama_challenge, dc.challenge_type, dc.is_active, dc.is_permanent 
    FROM challenge_of_the_day cotd
    JOIN daily_challenges dc ON cotd.challenge_id = dc.challenge_id
    WHERE cotd.tanggal = CURRENT_DATE
  `);
  console.log('TODAY\'S CHALLENGES OF THE DAY:');
  console.table(res3.rows);

  await client.end();
}

main().catch(console.error);

