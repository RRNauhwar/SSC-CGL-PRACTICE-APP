import { ApiProperty } from '@nestjs/swagger';

/**
 * Canonical error envelope returned by the API for every failure.
 *
 * A single, documented shape means clients (web/mobile) can handle errors
 * uniformly, and the `requestId` lets support correlate a user-visible error
 * with server logs/traces.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: 400, description: 'HTTP status code.' })
  statusCode!: number;

  @ApiProperty({
    example: 'BAD_REQUEST',
    description: 'Stable, machine-readable error code.',
  })
  error!: string;

  @ApiProperty({
    description: 'Human-readable message(s) describing what went wrong.',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    example: 'Validation failed',
  })
  message!: string | string[];

  @ApiProperty({ example: '/api/v1/health', description: 'Request path.' })
  path!: string;

  @ApiProperty({
    example: '2026-07-10T10:15:30.000Z',
    description: 'ISO-8601 timestamp of the error.',
  })
  timestamp!: string;

  @ApiProperty({
    example: '2f1c9e0a-6b3d-4c7e-9a11-8f2d3c4b5a6e',
    description: 'Correlation id (matches the x-request-id response header).',
  })
  requestId!: string;
}
