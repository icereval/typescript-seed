import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as TypeOrm from 'typeorm';
import config from '../../config';
import logger from '../../logging';


@TypeOrm.Entity()
@TypeOrm.Index("username_unique", (user: User) => [ user.username ], { unique: true })
export class User {

    @TypeOrm.PrimaryColumn('int', { generated: true })
    id: number;

    @TypeOrm.Column('text')
    username: string;

    @TypeOrm.Column('text')
    password: string;

    @TypeOrm.Column('text')
    fullname: string;

    @TypeOrm.Column('boolean')
    active: boolean;

    static async create(user: User): Promise<User> {
        const repo = TypeOrm.getConnection().getRepository(User);

        const exists = await repo.count({ username: user.username });
        if (exists) {
            throw new Error('User Already Exists');
        }

        let entity = repo.create(user);
        // Source: https://blogs.dropbox.com/tech/2016/09/how-dropbox-securely-stores-your-passwords/
        entity.password = User.encrypt(await User.bcrypt(User.sha512(entity.password)));
        entity.active = true;
        entity = await repo.persist(entity);

        return entity;
    }

    static async update(user: User): Promise<User> {
        const repo = TypeOrm.getConnection().getRepository(User);

        const queryBuilder = await repo.createQueryBuilder('user')
            .where('user.id = :id')
            .setParameters({ id: user.id });

        let entity = await queryBuilder.getOne();
        if (!entity) {
            throw new Error('User Not Fond');
        }

        entity = repo.merge(entity, user);

        if (user.password) {
            // Source: https://blogs.dropbox.com/tech/2016/09/how-dropbox-securely-stores-your-passwords/
            entity.password = User.encrypt(await User.bcrypt(User.sha512(entity.password)));
        }

        return await repo.persist(entity);
    }

    static async verify(username: string, password: string): Promise<User> {
        const repo = TypeOrm.getConnection().getRepository(User);

        return await repo.transaction(async (repo) => {
            const user = await repo.findOne({ username });
            if (!user) {
                throw new Error('User Not Found');
            }

            const validPassword = await new Promise<boolean>((resolve, reject) =>  {
                // TODO: Ensure constant time bcrypt
                bcrypt.compare(User.sha512(password), User.decrypt(user.password), ((err, same) => resolve(same)));
            });

            if (!validPassword) {
                throw new Error('Invalid Password');
            }

            return user;
        });        
    }

    private static sha512(data: string): string {
        return crypto.createHash('sha512')
            .update(data)
            .digest()
            .toString();
    }

    private static async bcrypt(data: string): Promise<string> {
        return await new Promise<string>((resolve, reject) => {
            bcrypt.hash(data, 10, (err, hash) => resolve(hash));
        });
    }

    private static encrypt(data: string): string {
        let cipher = crypto.createCipher('aes256', config.get('app:encryption_password'));

        let encrypted = cipher.update(data, 'utf8', 'binary');
        encrypted += cipher.final('binary');

        return encrypted;
    }

    private static decrypt(data: string): string {
        let decipher = crypto.createDecipher('aes256', config.get('app:encryption_password'));

        let decrypted = decipher.update(data, 'binary', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}

export default User;
