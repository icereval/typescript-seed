import * as TypeOrm from 'typeorm';
import User from './user';
import config from '../../config';
import logger from '../../logging';


@TypeOrm.Entity()
export class Session {

    @TypeOrm.PrimaryColumn('bigint', { generated: true })
    id: number;

    @TypeOrm.OneToOne(type => User)
    @TypeOrm.JoinColumn()
    user: User;

    static async create(user: User): Promise<Session> {
        const repo = TypeOrm.getConnection().getRepository(Session);
        const session = repo.create({ user });

        return await repo.persist(session);
    }
}

export default Session;
