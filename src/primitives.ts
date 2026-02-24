export const PRIMITIVE_MAP: Record<string, string> = {
  // Integers
  uint8: 'number',
  int8: 'number',
  uint16: 'number',
  int16: 'number',
  uint32: 'number',
  int32: 'number',
  uint64: 'number',
  int64: 'number',
  uint128: 'number',
  int128: 'number',
  uint256: 'number',
  int256: 'number',
  uint512: 'number',
  int512: 'number',
  varuint32: 'number',
  varint32: 'number',

  // Floats
  float32: 'number',
  float64: 'number',
  float128: 'number',
  float256: 'number',

  // String-like
  string: 'string',
  name: 'string',
  asset: 'string',
  symbol: 'string',
  symbol_code: 'string',
  time_point: 'string',
  time_point_sec: 'string',
  block_timestamp_type: 'string',
  checksum160: 'string',
  checksum256: 'string',
  checksum512: 'string',
  public_key: 'string',
  signature: 'string',
  extended_asset: 'string',

  // Boolean
  bool: 'boolean',

  // Binary
  bytes: 'Uint8Array',
};

export function getPrimitiveMapping(type: string): string | undefined {
  return PRIMITIVE_MAP[type];
}
