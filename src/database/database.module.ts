import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        console.log('🔹 Connecting to MongoDB...');

        return {
          uri,
          onConnectionCreate: (connection: Connection) => {
            // Register event listeners
            connection.on('connected', () => {
              console.log('✅ MongoDB connection established.');
            });
            connection.on('error', (err) => {
              console.error('🔴 MongoDB connection error:', err);
            });
            connection.on('disconnected', () => {
              console.log('❌ MongoDB connection disconnected.');
            });

            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
