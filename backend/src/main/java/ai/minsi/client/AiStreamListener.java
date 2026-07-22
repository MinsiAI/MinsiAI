package ai.minsi.client;

@FunctionalInterface
public interface AiStreamListener {

    boolean onDelta(String delta);
}
