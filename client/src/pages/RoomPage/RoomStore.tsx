type RoomStoreProps = {
    roomId: number,
};

type RoomStoreState = {
    roomId: number,
};

class RoomStore {
    private state: RoomStoreState;

    constructor(props: Readonly<RoomStoreProps>) {
        this.state = {
            roomId: props.roomId,
        };
    }
}

export default RoomStore;