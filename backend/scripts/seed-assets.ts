import { Pool } from 'pg';
import { config } from '../src/config';

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

const assets = [
  {
    name: 'MacBook Pro 16" M3',
    serial_number: 'SN-MBP-M3-2024-001',
    category: 'laptop',
    status: 'available',
    condition: 'excellent',
    purchase_date: '2024-06-15',
    purchase_cost: 3499.00,
    warranty_expiry: '2027-06-15',
    vendor: 'Apple Inc.',
    location: 'Building A - Floor 3',
    description: '2024 MacBook Pro 16-inch with M3 Max chip, 64GB RAM, 1TB SSD. Silver color.',
  },
  {
    name: 'Dell UltraSharp 27" Monitor',
    serial_number: 'SN-DELL-U2723-2024-001',
    category: 'monitor',
    status: 'assigned',
    condition: 'good',
    purchase_date: '2024-03-10',
    purchase_cost: 619.99,
    warranty_expiry: '2027-03-10',
    vendor: 'Dell Technologies',
    location: 'Building B - Floor 2',
    description: 'Dell UltraSharp U2723QE 4K USB-C Hub Monitor, 27-inch IPS Black panel.',
  },
  {
    name: 'iPhone 15 Pro Max',
    serial_number: 'SN-IP15PM-2024-003',
    category: 'mobile',
    status: 'assigned',
    condition: 'excellent',
    purchase_date: '2024-09-20',
    purchase_cost: 1199.00,
    warranty_expiry: '2026-09-20',
    vendor: 'Apple Inc.',
    location: 'Building A - Floor 1',
    description: 'iPhone 15 Pro Max 256GB, Natural Titanium. Company-issued mobile device.',
  },
  {
    name: 'Logitech MX Master 3S Mouse',
    serial_number: 'SN-LOG-MX3S-2024-001',
    category: 'peripheral',
    status: 'available',
    condition: 'excellent',
    purchase_date: '2024-11-01',
    purchase_cost: 99.99,
    warranty_expiry: '2026-11-01',
    vendor: 'Logitech',
    location: 'IT Storage - Building A',
    description: 'Logitech MX Master 3S Wireless Performance Mouse, Graphite color.',
  },
  {
    name: 'Cisco Meraki MR56 Access Point',
    serial_number: 'SN-CISCO-MR56-2024-001',
    category: 'infrastructure',
    status: 'available',
    condition: 'excellent',
    purchase_date: '2024-08-12',
    purchase_cost: 1299.00,
    warranty_expiry: '2027-08-12',
    vendor: 'Cisco Systems',
    location: 'Server Room - Building A',
    description: 'Cisco Meraki MR56 Wi-Fi 6E Cloud-Managed Access Point for high-density office.',
  },
  {
    name: 'Herman Miller Aeron Chair',
    serial_number: 'SN-HM-AERON-2024-001',
    category: 'furniture',
    status: 'assigned',
    condition: 'good',
    purchase_date: '2024-01-20',
    purchase_cost: 1595.00,
    warranty_expiry: '2029-01-20',
    vendor: 'Herman Miller',
    location: 'Building B - Floor 1',
    description: 'Herman Miller Aeron Ergonomic Office Chair, Size B, Graphite finish.',
  },
  {
    name: 'Samsung Galaxy Tab S9 Ultra',
    serial_number: 'SN-SAM-TAB9-2024-001',
    category: 'mobile',
    status: 'in_repair',
    condition: 'fair',
    purchase_date: '2024-05-30',
    purchase_cost: 1199.99,
    warranty_expiry: '2026-05-30',
    vendor: 'Samsung Electronics',
    location: 'IT Repair Center - Building A',
    description: 'Samsung Galaxy Tab S9 Ultra 14.6", 256GB, Wi-Fi. Screen replacement needed.',
  },
  {
    name: 'Synology DS1823xs+ NAS',
    serial_number: 'SN-SYN-DS1823-2024-001',
    category: 'infrastructure',
    status: 'available',
    condition: 'excellent',
    purchase_date: '2024-10-05',
    purchase_cost: 2899.00,
    warranty_expiry: '2027-10-05',
    vendor: 'Synology Inc.',
    location: 'Server Room - Building A',
    description: 'Synology DS1823xs+ 8-Bay NAS with 48TB storage (6x8TB Seagate IronWolf).',
  },
  {
    name: 'Apple Magic Keyboard (US Layout)',
    serial_number: 'SN-APL-MK-2024-001',
    category: 'peripheral',
    status: 'available',
    condition: 'excellent',
    purchase_date: '2024-12-01',
    purchase_cost: 149.00,
    warranty_expiry: '2026-12-01',
    vendor: 'Apple Inc.',
    location: 'IT Storage - Building A',
    description: 'Apple Magic Keyboard with Touch ID and Numeric Keypad, US English layout, Silver.',
  },
  {
    name: 'LG 34" UltraWide Curved Monitor',
    serial_number: 'SN-LG-34WN80C-2024-001',
    category: 'monitor',
    status: 'assigned',
    condition: 'good',
    purchase_date: '2024-07-22',
    purchase_cost: 799.99,
    warranty_expiry: '2027-07-22',
    vendor: 'LG Electronics',
    location: 'Building A - Floor 2',
    description: 'LG 34WN80C-B 34-inch 21:9 Curved UltraWide WQHD IPS Monitor with USB-C.',
  },
];

async function seedAssets() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding 10 assets...\n');

    for (const asset of assets) {
      const { rows } = await client.query(
        `INSERT INTO assets (name, serial_number, category, status, condition, purchase_date, purchase_cost, warranty_expiry, vendor, location, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, name, asset_tag, category, status`,
        [
          asset.name,
          asset.serial_number,
          asset.category,
          asset.status,
          asset.condition,
          asset.purchase_date,
          asset.purchase_cost,
          asset.warranty_expiry,
          asset.vendor,
          asset.location,
          asset.description,
        ]
      );
      const a = rows[0];
      console.log(`  ✅ ${a.asset_tag} - ${a.name} (${a.category}, ${a.status})`);
    }

    // Advance the sequence past the seeded assets
    await client.query(`SELECT setval('asset_tag_seq', COALESCE(
      (SELECT MAX(CAST(REGEXP_REPLACE(asset_tag, '[^0-9]', '', 'g') AS INTEGER)) FROM assets),
      0
    ))`);

    console.log('\n🎉 All 10 assets seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', (err as Error).message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedAssets();
