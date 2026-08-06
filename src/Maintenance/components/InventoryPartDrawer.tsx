import React from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Typography,
} from '@mui/material';
import {
  Inventory2Outlined as InventoryIcon,
  LocalShippingOutlined as ReceivingIcon,
} from '@mui/icons-material';
import { activeTheme } from '../../theme';
import StandardDialog from '../../common/components/StandardDialog';

export type InventorySupplier = {
  name: string;
  supplier: string;
};

export type InventorySiteAvailability = {
  name: string;
  city: string;
  quantity: number;
};

export type InventoryPart = {
  id: string;
  sapNumber: string;
  category: string;
  condition: 'New' | 'Refurbished';
  name: string;
  usedIn: Array<{ id: string; name: string; path: string }>;
  binLocation: string;
  manufacturer: string;
  unitPrice: number;
  currentStock: number;
  reservedStock: number;
  safetyStock: number;
  notes: string;
  photoSrc: string;
  drawingSrc: string;
  suppliers: InventorySupplier[];
  siteAvailability: InventorySiteAvailability[];
  icon: React.ReactNode;
};

export type StockState = 'in-stock' | 'low-stock' | 'out-of-stock';

const inventoryPanelBorder = 'var(--paper-border-color)';
const inventoryPanelBackground = activeTheme.backgroundPaper;

const stateStyles: Record<StockState, { tone: string; border: string; bg: string; label: string }> = {
  'in-stock': { tone: '#15803D', border: '#BBF7D0', bg: '#ECFDF3', label: 'In Stock' },
  'low-stock': { tone: '#D97706', border: '#FED7AA', bg: '#FFF7ED', label: 'Low Stock' },
  'out-of-stock': { tone: '#DC2626', border: '#FECACA', bg: '#FEF2F2', label: 'Out of Stock' },
};

const inventoryCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

function normalizePartCode(value: string) {
  return value.trim().toLowerCase().replace(/^sp-/, '').replace(/[^a-z0-9]/g, '');
}

function buildDrawingSrc(title: string, subtitle: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
      <rect width="640" height="420" rx="28" fill="#F8FAFC" />
      <rect x="30" y="30" width="580" height="360" rx="24" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
      <rect x="150" y="120" width="250" height="92" rx="10" fill="none" stroke="#2563EB" stroke-width="4" />
      <rect x="410" y="102" width="70" height="128" rx="10" fill="none" stroke="#2563EB" stroke-width="4" />
      <circle cx="150" cy="166" r="34" fill="none" stroke="#2563EB" stroke-width="4" />
      <line x1="110" y1="84" x2="510" y2="84" stroke="#64748B" stroke-width="2" stroke-dasharray="8 6" />
      <line x1="110" y1="256" x2="510" y2="256" stroke="#64748B" stroke-width="2" stroke-dasharray="8 6" />
      <text x="255" y="74" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#334155">Technical drawing</text>
      <text x="250" y="318" font-family="Arial, sans-serif" font-size="18" fill="#475569">${subtitle}</text>
      <text x="246" y="345" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#0F172A">${title}</text>
    </svg>
  `)}`;
}

const defaultUsedIn = [
  {
    id: 'SA-204',
    name: 'Syringe Assembly Machine SA-204',
    path: 'Plant A > Unit B > Line 10 > Syringe Assembly Machine SA-204',
  },
  {
    id: 'PC-09',
    name: 'Packaging Conveyor PC-09',
    path: 'Plant A > Unit B > Line 20 > Packaging Conveyor PC-09',
  },
];

const inventoryParts: InventoryPart[] = [
  {
    id: 'inv-sap-seal-hyd-01',
    sapNumber: 'SAP-SEAL-HYD-01',
    category: 'Seal',
    condition: 'New',
    name: 'Hydraulic Cylinder Seal Kit',
    usedIn: defaultUsedIn,
    binLocation: 'TC1-M3-G2',
    manufacturer: 'Parker Sealing',
    unitPrice: 38,
    currentStock: 10,
    reservedStock: 7,
    safetyStock: 3,
    notes: 'Seal kit for hydraulic cylinder maintenance.',
    photoSrc: '/images/spear_parts/seal.jpg',
    drawingSrc: buildDrawingSrc('SAP-SEAL-HYD-01', 'Hydraulic seal kit'),
    suppliers: [{ name: 'Parker Sealing Systems', supplier: 'SUP-SEA-211' }],
    siteAvailability: [{ name: 'Sandy', city: 'Sandy', quantity: 3 }],
    icon: <InventoryIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-sap-oring-vit-02',
    sapNumber: 'SAP-ORING-VIT-02',
    category: 'Seal',
    condition: 'New',
    name: '10-Ring Set (Viton)',
    usedIn: defaultUsedIn,
    binLocation: 'TC1-M3-G2',
    manufacturer: 'Freudenberg Industrial',
    unitPrice: 24,
    currentStock: 10,
    reservedStock: 7,
    safetyStock: 3,
    notes: 'Viton ring set for sealing applications.',
    photoSrc: '/images/spear_parts/seal.jpg',
    drawingSrc: buildDrawingSrc('SAP-ORING-VIT-02', 'Viton ring set'),
    suppliers: [{ name: 'Freudenberg Industrial', supplier: 'SUP-SEA-212' }],
    siteAvailability: [{ name: 'El Paso', city: 'El Paso', quantity: 6 }],
    icon: <InventoryIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-sap-hyd-fluid-01',
    sapNumber: 'SAP-HYD-FLUID-01',
    category: 'Lubricant',
    condition: 'New',
    name: 'Hydraulic Fluid (1L)',
    usedIn: defaultUsedIn,
    binLocation: 'TC1-M3-G2',
    manufacturer: 'Shell Omala',
    unitPrice: 16,
    currentStock: 10,
    reservedStock: 10,
    safetyStock: 4,
    notes: 'Hydraulic fluid used during maintenance and top-off activities.',
    photoSrc: '/images/spear_parts/Synthetic Gear Oil ISO.png',
    drawingSrc: buildDrawingSrc('SAP-HYD-FLUID-01', '1L fluid container'),
    suppliers: [{ name: 'Shell Industrial Lubricants', supplier: 'SUP-LUB-221' }],
    siteAvailability: [{ name: 'Columbus West', city: 'Columbus', quantity: 12 }],
    icon: <InventoryIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-sap-filter-hyd-03',
    sapNumber: 'SAP-FILTER-HYD-03',
    category: 'Filter',
    condition: 'New',
    name: 'Hydraulic Return Filter',
    usedIn: defaultUsedIn,
    binLocation: 'TC1-M2-B4',
    manufacturer: 'Hydac Systems',
    unitPrice: 84,
    currentStock: 6,
    reservedStock: 0,
    safetyStock: 2,
    notes: 'Return-line hydraulic filter element.',
    photoSrc: '/images/spear_parts/Hydraulic Return Filter 10 Micron.jpg',
    drawingSrc: buildDrawingSrc('SAP-FILTER-HYD-03', 'Return filter'),
    suppliers: [{ name: 'Hydac Filtration Channel', supplier: 'SUP-FIL-231' }],
    siteAvailability: [{ name: 'Tijuana', city: 'Tijuana', quantity: 4 }],
    icon: <InventoryIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-sap-belt-cv-210',
    sapNumber: 'SAP-BELT-CV-210',
    category: 'Belt',
    condition: 'New',
    name: 'Conveyor Drive Belt',
    usedIn: defaultUsedIn,
    binLocation: 'TC1-M1-A2',
    manufacturer: 'Gates Power',
    unitPrice: 118,
    currentStock: 5,
    reservedStock: 3,
    safetyStock: 2,
    notes: 'Drive belt for conveyor CV-210.',
    photoSrc: '/images/spear_parts/belt.jpg',
    drawingSrc: buildDrawingSrc('SAP-BELT-CV-210', 'Conveyor belt'),
    suppliers: [{ name: 'Gates Power Transmission', supplier: 'SUP-BEL-221' }],
    siteAvailability: [{ name: 'Sandy', city: 'Sandy', quantity: 2 }],
    icon: <InventoryIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-sap-enc-cbl-402',
    sapNumber: 'SAP-ENC-CBL-402',
    category: 'Harness',
    condition: 'New',
    name: 'Servo Encoder Cable',
    usedIn: defaultUsedIn,
    binLocation: 'TC1-M4-C1',
    manufacturer: 'Lapp Industrial',
    unitPrice: 286,
    currentStock: 4,
    reservedStock: 3,
    safetyStock: 1,
    notes: 'Servo feedback cable for encoder loops.',
    photoSrc: '/images/spear_parts/Servo Feedback Harness.jpg',
    drawingSrc: buildDrawingSrc('SAP-ENC-CBL-402', 'Servo cable'),
    suppliers: [{ name: 'Lapp Industrial Cabling', supplier: 'SUP-HAR-321' }],
    siteAvailability: [{ name: 'Plymouth', city: 'Plymouth', quantity: 3 }],
    icon: <InventoryIcon sx={{ fontSize: 34 }} />,
  },
  {
    id: 'inv-sap-grip-vac-00',
    sapNumber: 'SAP-GRIP-VAC-00',
    category: 'Consumable',
    condition: 'New',
    name: 'Robot Gripper Vacuum Cup Set',
    usedIn: defaultUsedIn,
    binLocation: 'TC1-M4-C2',
    manufacturer: 'SMC Pneumatics',
    unitPrice: 62,
    currentStock: 0,
    reservedStock: 0,
    safetyStock: 2,
    notes: 'Vacuum cup set for robot gripper end effector.',
    photoSrc: '',
    drawingSrc: buildDrawingSrc('SAP-GRIP-VAC-00', 'Vacuum cup set'),
    suppliers: [{ name: 'SMC Air Prep Distributor', supplier: 'SUP-FIL-233' }],
    siteAvailability: [{ name: 'Franklin Lakes', city: 'Franklin Lakes', quantity: 1 }],
    icon: <InventoryIcon sx={{ fontSize: 34 }} />,
  },
];

export function findInventoryPartByCode(value?: string | null) {
  if (!value) return null;
  const normalizedValue = normalizePartCode(value);
  return inventoryParts.find((part) => (
    normalizePartCode(part.sapNumber) === normalizedValue ||
    normalizePartCode(part.id) === normalizedValue
  )) ?? null;
}

export function getAvailableStock(part: Pick<InventoryPart, 'currentStock' | 'reservedStock'>) {
  return Math.max(part.currentStock - part.reservedStock, 0);
}

export function getInventoryStockState(part: Pick<InventoryPart, 'currentStock' | 'reservedStock' | 'safetyStock'>): StockState {
  const availableStock = getAvailableStock(part);

  if (part.currentStock <= 0 || availableStock <= 0) return 'out-of-stock';
  if (availableStock <= part.safetyStock || part.currentStock <= part.safetyStock) return 'low-stock';
  return 'in-stock';
}

function InventoryInfoField({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography sx={{ color: 'text.primary', fontWeight: 850, lineHeight: 1.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

// NOTE: Centered dialog despite "Drawer" name — kept for backwards compatibility
export function InventoryPartDrawer({
  part,
  open,
  onClose,
  purchaseRequested,
  onRequestPurchase,
}: {
  part: InventoryPart | null;
  open: boolean;
  onClose: () => void;
  purchaseRequested: boolean;
  onRequestPurchase: (partId: string) => void;
}) {
  if (!part) return null;

  const stockState = getInventoryStockState(part);
  const style = stateStyles[stockState];
  const availableStock = getAvailableStock(part);
  const shouldReplenishStock = stockState === 'low-stock' || stockState === 'out-of-stock';
  const suggestedReorderQuantity = Math.max(part.safetyStock * 2 - availableStock, part.safetyStock);

  return (
    <StandardDialog
      open={open}
      onClose={onClose}
      title="Inventory Item"
      subtitle={part.sapNumber}
      maxWidth="md"
      headerChip={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap' }}>
          <Chip label={part.category} size="small" sx={{ bgcolor: 'background.default', color: 'text.secondary', border: '1px solid var(--paper-border-color)', fontWeight: 900 }} />
          <Chip label={style.label} size="small" sx={{ bgcolor: style.bg, color: style.tone, border: `1px solid ${style.border}`, fontWeight: 900 }} />
        </Box>
      }
      footer={
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, width: '100%', flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Inventory details stay in context without leaving the list.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {shouldReplenishStock ? (
              <Button variant={purchaseRequested ? 'outlined' : 'contained'} startIcon={<ReceivingIcon sx={{ fontSize: 18 }} />} onClick={() => onRequestPurchase(part.id)} disabled={purchaseRequested} sx={{ borderRadius: '8px', boxShadow: 'none', fontWeight: 900, '&:hover': { boxShadow: 'none' } }}>
                {purchaseRequested ? 'Purchase requested' : 'Request purchase'}
              </Button>
            ) : null}
            <Button variant="contained" onClick={onClose} sx={{ borderRadius: '8px', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}>
              Close
            </Button>
          </Box>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.6 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.5,
            bgcolor: 'var(--token-brand-soft-bg)',
            color: 'primary.main',
            display: 'grid',
            placeItems: 'center',
            border: '1px solid var(--token-brand-lightest)',
            flexShrink: 0,
          }}
        >
          {part.icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: 'text.primary', fontSize: 19, fontWeight: 900, lineHeight: 1.15 }}>
            {part.name}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontWeight: 700, mt: 0.3 }}>
            {part.category}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.2, mb: 1.6 }}>
        {part.photoSrc ? (
          <Box component="img" src={part.photoSrc} alt={`${part.name} photo`} sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 2.5, border: '1px solid var(--paper-border-color)', bgcolor: 'background.default' }} />
        ) : (
          <Box sx={{ width: '100%', height: 200, borderRadius: 2.5, border: '1px dashed var(--paper-border-color)', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 600 }}>
              No Image Available
            </Typography>
          </Box>
        )}
        <Box component="img" src={part.drawingSrc} alt={`${part.name} technical drawing`} sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 2.5, border: '1px solid var(--paper-border-color)', bgcolor: 'background.default' }} />
      </Box>

      <Paper elevation={0} sx={{ mb: 1.5, p: 1.25, borderRadius: '8px', border: '1px solid var(--paper-border-color)', bgcolor: 'background.paper' }}>
        <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 900, mb: 1.1 }}>
          Part Information
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.05 }}>
          <InventoryInfoField label="Part Number" value={part.sapNumber} />
          <InventoryInfoField label="Location" value={`Bin ${part.binLocation}`} />
          <InventoryInfoField label="Unit Value" value={inventoryCurrencyFormatter.format(part.unitPrice)} />
          <InventoryInfoField label="Condition" value={part.condition} />
        </Box>
        <Box sx={{ mt: 1.15 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.55 }}>
            Equipment Using This Part
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
            {part.usedIn.map((equipment) => (
              <Box key={equipment.id} sx={{ px: 1, py: 0.85, borderRadius: 2, border: '1px solid var(--paper-border-color)', bgcolor: 'background.paper' }}>
                <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  {equipment.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {equipment.path}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ mt: 1.2, p: 1.25, borderRadius: '8px', border: '1px solid var(--paper-border-color)', bgcolor: 'background.paper' }}>
        <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 900, mb: 1.1 }}>
          Stock Level
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, gap: 1 }}>
          <InventoryInfoField label="Current" value={String(part.currentStock)} />
          <InventoryInfoField label="Reserved" value={String(part.reservedStock)} />
          <InventoryInfoField label="Future" value={String(availableStock)} />
          <InventoryInfoField label="Safety" value={String(part.safetyStock)} />
        </Box>
        {shouldReplenishStock ? (
          <Box sx={{ mt: 1.2, p: 1, borderRadius: 2, border: `1px solid ${stockState === 'out-of-stock' ? '#FCA5A5' : '#FDBA74'}`, bgcolor: stockState === 'out-of-stock' ? '#FEF2F2' : '#FFF7ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: 'text.primary', fontWeight: 900 }}>
                Replenishment needed
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>
                Suggested purchase quantity: {suggestedReorderQuantity} units
              </Typography>
            </Box>
            <Button variant={purchaseRequested ? 'outlined' : 'contained'} startIcon={<ReceivingIcon sx={{ fontSize: 18 }} />} onClick={() => onRequestPurchase(part.id)} disabled={purchaseRequested} sx={{ borderRadius: '8px', boxShadow: 'none', fontWeight: 900, whiteSpace: 'normal', lineHeight: 1.2, '&:hover': { boxShadow: 'none' } }}>
              {purchaseRequested ? 'Purchase requested' : 'Request purchase'}
            </Button>
          </Box>
        ) : null}
      </Paper>

      <Paper elevation={0} sx={{ mt: 1.2, p: 1.25, borderRadius: '8px', border: '1px solid var(--paper-border-color)', bgcolor: 'background.paper' }}>
        <Typography sx={{ color: 'text.primary', fontSize: 14, fontWeight: 900, mb: 1.1 }}>
          Availability
        </Typography>
        <Box sx={{ mb: 1.25 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.55 }}>
            Suppliers
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            {part.suppliers.map((supplier) => (
              <Box key={`${supplier.name}-${supplier.supplier}`} sx={{ px: 1, py: 0.9, borderRadius: 2, border: '1px solid var(--paper-border-color)', bgcolor: 'background.paper', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  {supplier.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  {supplier.supplier}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 0.55 }}>
            Other Sites With Stock
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
            {part.siteAvailability.map((site) => (
              <Box key={`${site.name}-${site.city}`} sx={{ px: 1, py: 0.9, borderRadius: 2, border: '1px solid var(--paper-border-color)', bgcolor: 'background.paper', display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1.4fr) minmax(0, 0.9fr) auto' }, gap: 0.8, alignItems: 'center' }}>
                <Typography sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  {site.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {site.city}
                </Typography>
                <Chip size="small" label={`${site.quantity} in stock`} sx={{ bgcolor: 'var(--token-brand-soft-bg)', color: 'primary.main', border: '1px solid var(--token-brand-lightest)', fontWeight: 900, width: 'fit-content' }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </StandardDialog>
  );
}
